from openai import OpenAI
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime, timedelta
import supabase
import json
import os
from dotenv import load_dotenv
import re
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
# Load environment variables from .env file
load_dotenv()


# Add this code to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://harborhackers.vercel.app",
                   "https://harborhackers.onrender.com"],  # Adjust to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Access environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
# Set your OpenAI API key
client = OpenAI(api_key=openai_api_key)
# Initialize Supabase client (make sure you've set your Supabase URL and Key)

supabase_client = supabase.create_client(supabase_url, supabase_key)


class EmployeeSuggestedCourse(BaseModel):
    employee_id: str
    course_id: str
    # Timestamp of when the course was suggested
    suggested_at: Optional[datetime] = None
# Define the Employee model


class Employee(BaseModel):
    user_id: str
    full_name: str
    department: str
    experience_level: str
    skills: str
    hobbies: str

# Define the Task model


class Task(BaseModel):
    task_id: Optional[str] = None
    user_id: str
    partner_id: Optional[str] = None
    # Limit this in the input generation step (max 10 words)
    task_description: str
    task_type: str  # single_fun, pair_fun, single_work, pair_work
    difficulty: str  # easy, medium, hard
    points: int  # Points calculated based on difficulty
    due_by: str  # Due date (formatted as string for easier handling)
    completed: bool = False  # New field for task completion status
    completed_at: Optional[str] = None  # Will be null until task is completed
    created_at: Optional[str] = None  # Default to current date

    @staticmethod
    def calculate_due_date(difficulty: str) -> str:
        """Calculate due date based on difficulty level."""
        days_map = {
            "easy": 1,
            "medium": 3,
            "hard": 5
        }
        days_to_add = days_map.get(difficulty, 1)
        due_date = datetime.now() + timedelta(days=days_to_add)
        return due_date.strftime('%Y-%m-%d')

    @staticmethod
    def calculate_points(difficulty: str) -> int:
        """Calculate points based on difficulty level."""
        points_map = {
            "easy": 3,
            "medium": 5,
            "hard": 10
        }
        return points_map.get(difficulty, 0)

    @classmethod
    def create_task(cls, user_id: str, partner_id: Optional[str], task_description: str, task_type: str, difficulty: str) -> 'Task':
        """Create a task with default values for points and due date."""

        return cls(
            user_id=user_id,
            partner_id=partner_id,
            task_description=task_description,
            task_type=task_type,
            difficulty=difficulty,
            points=cls.calculate_points(difficulty),
            due_by=cls.calculate_due_date(difficulty),
            created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )


class Course(BaseModel):
    title: str
    provider: str
    upcoming_date: Optional[str] = None
    course_fee: Optional[str] = None
    id: str  # assuming uuid is stored as a string

# Fetch courses from Supabase


def fetch_courses_from_supabase() -> List[Course]:
    try:
        # Fetch courses data from the 'courses' table
        response = supabase_client.table("courses").select("*").execute()

        # Handle possible errors by checking if 'data' is None
        if not response.data:
            raise Exception("No data found or error in fetching courses.")

        # Map Supabase data to Course model
        courses = [
            Course(
                title=course["Title"],  # Ensure matching column names
                provider=course["Provider"],
                upcoming_date=course.get("Upcoming Date", "NA"),
                course_fee=course.get("Course Fee", "Not Provided"),
                id=course["id"]  # UUID primary key
            )
            for course in response.data
        ]
        return courses

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching courses from Supabase: {str(e)}"
        )


# Use OpenAI to generate suggested courses


# Example of calling OpenAI to generate suggested courses
def generate_suggested_courses_with_openai(employee: Employee, courses: List[Course]) -> List[dict]:
    course_list_str = "\n".join(
        [f"- {course.title} by {course.provider}, Fee: {course.course_fee}, Date: {course.upcoming_date or 'NA'}"
         for course in courses]
    )

    prompt = f"""
    Suggest 3-5 suitable courses for the following employee based on their department, skills, and experience level:
    
    Employee:
    - Name: {employee.full_name}
    - Department: {employee.department}
    - Experience Level: {employee.experience_level}
    - Skills: {employee.skills}

    Available Courses:
    {course_list_str}

    Please respond with a valid JSON list of recommended course IDs in this format:
    [
      {{"course_id": "<course_title> by <course_provider"}},
      ...
    ]
    Only return the JSON output with no additional commentary.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an assistant generating course recommendations for employees."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )

        raw_response = response.choices[0].message.content.strip()
        print(f"OpenAI Response: {raw_response}")  # Debugging step

        # Extract and parse the JSON response
        json_match = re.search(r"\[.*\]", raw_response, re.DOTALL)
        if not json_match:
            raise ValueError("JSON data not found in the response")

        return json.loads(json_match.group())

    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error parsing JSON from OpenAI: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error parsing JSON from OpenAI: {str(e)}"
        )
    except Exception as e:
        print(f"General error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error generating suggestions with OpenAI: {str(e)}"
        )


# Insert the suggested courses into the employee_suggested_courses relational table


def insert_suggested_courses(employee_id: str, course_ids: List[str]):
    try:
        # Prepare the JSONB structure for suggested courses
        record = {
            "user_id": employee_id,
            "suggested_courses": json.dumps(course_ids),  # Store as JSONB
            "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        # Use upsert to insert or update if the record already exists
        response = supabase_client.table("employee_suggested_courses").upsert(record, on_conflict=["user_id"]).execute()

        # Check if the insertion or update failed by inspecting the response
        if not response.data:
            raise Exception(f"Insertion or update failed: {response}")

        print(f"Suggested courses inserted/updated for employee {employee_id}")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error inserting or updating suggested courses: {str(e)}"
        )



# Endpoint to generate and update suggested courses for all employees


# Endpoint to generate and update suggested courses for all employees
@app.post("/generate-suggested-courses")
def generate_and_update_suggested_courses():
    try:
        # Fetch employees and courses from Supabase
        employees = fetch_employees_from_supabase()
        courses = fetch_courses_from_supabase()

        # Loop through each employee and generate suggested courses
        for employee in employees:
            suggested_courses = generate_suggested_courses_with_openai(
                employee, courses)
            course_ids = [course["course_id"]
                          for course in suggested_courses]  # Extract course IDs

            # Insert into the employee_suggested_courses table
            insert_suggested_courses(employee.user_id, course_ids)

        return {"message": "Suggested courses generated and updated for all employees."}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating suggested courses: {str(e)}"
        )

# Endpoint to generate and update suggested courses for a single employee
@app.post("/generate-course-for/{employee_id}")
def generate_and_update_suggested_courses_for_employee(employee_id: str):
    try:
        # Fetch the employee from Supabase using employee_id
        employee = fetch_employee_by_id(employee_id)
        
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Fetch available courses from Supabase
        courses = fetch_courses_from_supabase()

        # Generate suggested courses for the employee using OpenAI
        suggested_courses = generate_suggested_courses_with_openai(employee, courses)
        course_ids = [course["course_id"] for course in suggested_courses]  # Extract course IDs

        # Insert the generated course suggestions into the employee_suggested_courses table
        insert_suggested_courses(employee.user_id, course_ids)

        return {
            "message": f"Suggested courses generated and updated for employee {employee_id}.",
            "suggested_courses": suggested_courses
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating suggested courses for employee {employee_id}: {str(e)}"
        )

# Function to fetch employees from Supabase


# Fetch employees from Supabase
def fetch_employees_from_supabase() -> List[Employee]:
    try:
        response = supabase_client.table("employees").select("*").execute()
        employees_data = response.data
        return [Employee(**emp) for emp in employees_data]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching employees from Supabase: {str(e)}"
        )

# Function to fetch an employee by user_id from Supabase


def fetch_employee_by_id(employee_id: str) -> Employee:
    try:
        # Query to fetch a specific employee from the employees table by user_id
        response = supabase_client.table("employees").select(
            "*").eq("user_id", employee_id).single().execute()  # Fetch a single row

        # Parse the data into an Employee model instance
        employee_data = response.data
        return Employee(**employee_data)  # Convert to Employee model

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching employee from Supabase: {str(e)}")


def get_fun_partner(employee: Employee, all_employees: List[Employee]) -> Optional[Employee]:
    """Use OpenAI to match a fun partner based on shared hobbies."""
    prompt = f"""
    Find the best match for a fun task based on shared hobbies. 
    The employee is:
    - Name: {employee.full_name} (ID: {employee.user_id})
    - Hobbies: {', '.join(employee.hobbies)}

    The output should just be the employee full name with no extra text. Choose a match from the following employees:
    """

    for emp in all_employees:
        if emp.user_id != employee.user_id:
            prompt += f"\n- {emp.full_name} (ID: {emp.user_id}), Hobbies: {', '.join(emp.hobbies)}"

    prompt += "\n\nSelect the best match based on shared hobbies and return the partner's name."

    # Use the new OpenAI method to get the partner match
    matched_name = get_openai_partner_match(prompt)

    # Match the partner's name with the employee data and return
    for emp in all_employees:
        if emp.full_name == matched_name:
            return emp
    return None


def get_work_partner(employee: Employee, all_employees: List[Employee]) -> Optional[Employee]:
    """Use OpenAI to match a work partner based on complementary skills."""
    prompt = f"""
    Find the best match for a collaborative work task based on complementary skills. 
    The employee is:
    - Name: {employee.full_name} (ID: {employee.user_id})
    - Department: {employee.department}
    - Skills: {', '.join(employee.skills)}

    The output should only be the employee full name with no extra text. Choose a match from the following employees:
    """

    for emp in all_employees:
        if emp.user_id != employee.user_id:
            prompt += f"\n- {emp.full_name} (ID: {emp.user_id}), Department: {emp.department}, Skills: {', '.join(emp.skills)}"

    prompt += "\n\nSelect the best match based on complementary skills and return the partner's name."

    # Use the new OpenAI method to get the partner match
    matched_name = get_openai_partner_match(prompt)

    # Match the partner's name with the employee data and return
    for emp in all_employees:
        if emp.full_name == matched_name:
            return emp
    return None


def get_openai_partner_match(prompt: str) -> Optional[str]:
    """Helper function to use OpenAI for partner matching based on a provided prompt."""
    try:
        response = client.chat.completions.create(
            model="gpt-4",  # or "gpt-3.5-turbo"
            messages=[
                {"role": "system", "content": "You are an assistant that helps find matching partners based on shared hobbies or complementary skills."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=10,  # Keep response concise
            temperature=0.5  # Adjust creativity for more consistent output
        )
        # Extract the matched partner's name
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting partner match from OpenAI: {str(e)}")


def get_employee_current_tasks(user_id: str) -> List[str]:
    """
    Fetches the current tasks of a specific employee from the tasks table in Supabase.
    Returns a list of task descriptions.
    """
    try:
        # Ensure user_id is properly formatted
        if not user_id:
            raise ValueError("Invalid user_id")

        # Query Supabase for tasks of the employee using the UUID only
        response = supabase_client.table("tasks").select(
            "task_description").eq("user_id", user_id).execute()

        # Parse the response data into a list of task descriptions
        tasks_data = response.data
        current_tasks = [task['task_description'] for task in tasks_data]

        # Return the list of task descriptions
        return current_tasks

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching tasks from Supabase: {str(e)}")


def generate_task_with_openai(prompt: str, task_type: str, current_tasks: List[str]) -> dict:
    """Helper function to generate task description using OpenAI with a specified format."""
    # Format the list of current tasks into a string
    formatted_current_tasks = "\n".join(
        [f"- {task}" for task in current_tasks])
    formatted_prompt = f"""
You are an assistant generating tasks for employees working at Port Singapore Authority. Please follow this exact JSON structure for the output.

Task Format:
{{
  "user_id": "<user_id>",
  "partner_id": "<partner_id or null>",
  "task_description": "<task_description (max 10 words)>",
  "task_type": "<task_type>",
  "difficulty": "<difficulty (easy/medium/hard)>",
}}

The employee currently has the following tasks:
{formatted_current_tasks}

Please generate a new task for the employee that is different from their current tasks. The task should be engaging and unique. It should also make sense. Randomly choose a difficulty for the task from easy,medium or hard. The task can either be related to the hobbies or related to the company.

Please ensure the response is valid JSON and follows the exact format above. Output should not have any extra text.
Generate a task of type {task_type}. {prompt}
"""

    try:
        # Call the OpenAI API
        response = client.chat.completions.create(
            model="gpt-4",  # or "gpt-3.5-turbo"
            messages=[
                {"role": "system", "content": "You are an assistant that generates employee tasks in JSON format."},
                {"role": "user", "content": formatted_prompt}
            ],
            max_tokens=1000,  # Limit to 50 tokens for brevity
            temperature=0.7
        )

        # Log raw response for debugging
        raw_response = response.choices[0].message.content.strip()
        if raw_response:
            print(raw_response)

        return json.loads(raw_response)  # Parse as JSON

    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}")  # Debug print for JSON errors
        raise HTTPException(
            status_code=500, detail=f"Error parsing JSON from OpenAI: {str(e)}")
    except Exception as e:
        print(f"General error: {e}")  # Debug print for general errors
        raise HTTPException(
            status_code=500, detail=f"Error generating task from OpenAI: {str(e)}")

### Task Generation Functions ###


def generate_singular_fun_task(employee: Employee) -> Task:
    current_tasks = get_employee_current_tasks(employee.user_id)
    prompt = f"""
    Create a fun task for the employee with the following details:
    - Name: {employee.full_name}
    - ID: {employee.user_id}
    - Department: {employee.department}
    - Experience Level: {employee.experience_level}
    - Skills: {', '.join(employee.skills)}
    - Hobbies: {', '.join(employee.hobbies)}.
    
    The task should be quick to complete and help forge a fun and lively work place environment.
    """
    task_desc = generate_task_with_openai(prompt, "single_fun", current_tasks)

    return Task.create_task(**task_desc)


def generate_pair_fun_task(employee: Employee, partner: Employee) -> Task:
    current_tasks = get_employee_current_tasks(employee.user_id)
    prompt = f"""
    Create a collaborative fun task for two employees based on their hobbies:
    - Employee 1: {employee.full_name} (ID: {employee.user_id}), Hobbies: {', '.join(employee.hobbies)}
    - Employee 2: {partner.full_name} (ID: {partner.user_id}), Hobbies: {', '.join(partner.hobbies)}.
    
    The task should involve both employees and foster teamwork and engagement. Leverage similiar hobbies if possible.
    """
    task_desc = generate_task_with_openai(prompt, "pair_fun", current_tasks)

    return Task.create_task(**task_desc)

# def generate_singular_work_task(employee: Employee) -> Task:
#     prompt = f"""
#     Create a work-related task for the employee with the following details:
#     - Name: {employee.full_name}
#     - ID: {employee.user_id}
#     - Department: {employee.department}
#     - Experience Level: {employee.experience_level}
#     - Skills: {', '.join(employee.skills)}

#     The task should be them taking up an upskilling course and be aligned with their current department and skills.
#     """
#     task_desc = generate_task_with_openai(prompt, "single_work")

#     return Task.create_task(**task_desc)


def generate_pair_work_task(employee: Employee, partner: Employee) -> Task:
    current_tasks = get_employee_current_tasks(employee.user_id)
    prompt = f"""
    Create a collaborative work task for two employees based on their skills:
    - Employee 1: {employee.full_name} (ID: {employee.user_id}), Department: {employee.department}, Skills: {employee.skills}
    - Employee 2: {partner.full_name} (ID: {partner.user_id}), Department: {partner.department}, Skills: {partner.skills}
    
    The task should require collaboration between both employees and leverage their skills. Should be able to be carried out within working hours.
    """
    task_desc = generate_task_with_openai(prompt, "pair_work", current_tasks)

    return Task.create_task(**task_desc)

### Main Task Generation for All Employees ###


@app.post("/generate-tasks-for-all")
def generate_tasks_for_all():
    tasks = []

    # Convert placeholder employee data to Employee objects
    employee_list = fetch_employees_from_supabase()

    # Loop through each employee
    for employee in employee_list:
        # Generate a single fun task
        single_fun_task = generate_singular_fun_task(employee)
        save_task_to_supabase(single_fun_task)  # Save to Supabase
        tasks.append(single_fun_task)

        # Generate a pair fun task
        partner_for_fun = get_fun_partner(employee, employee_list)
        if partner_for_fun:
            pair_fun_task = generate_pair_fun_task(employee, partner_for_fun)
            save_task_to_supabase(pair_fun_task)  # Save to Supabase
            tasks.append(pair_fun_task)

        # Generate a single work task
        # single_work_task = generate_singular_work_task(employee)
        # save_task_to_supabase(single_work_task)  # Save to Supabase
        # tasks.append(single_work_task)

        # Generate a pair work task
        partner_for_work = get_work_partner(employee, employee_list)
        if partner_for_work:
            pair_work_task = generate_pair_work_task(
                employee, partner_for_work)
            save_task_to_supabase(pair_work_task)  # Save to Supabase
            tasks.append(pair_work_task)

    return {"generated_tasks": tasks}


def save_task_to_supabase(task: Task) -> None:
    """
    Function to save a task to Supabase.
    Converts the Task object into a dictionary and inserts it into the 'tasks' table.
    """
    task_data = {
        "user_id": task.user_id,
        "partner_id": task.partner_id,
        "task_description": task.task_description,
        "task_type": task.task_type,
        "difficulty": task.difficulty,
        "points": task.points,
        "due_by": task.due_by,
        "completed": task.completed,
        "completed_at": task.completed_at,
        "created_at": task.created_at
    }

    try:
        response = supabase_client.table('tasks').insert(task_data).execute()

        print(f"Task for user {task.user_id} saved successfully.")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error saving task to Supabase: {str(e)}")

### Task Generation for Single Random Task ###


@app.post("/generate-random-task/{employee_id}")
def generate_random_task_for_employee(employee_id: str):
    # Fetch the employee from Supabase using employee_id
    employee = fetch_employee_by_id(employee_id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Fetch the list of employees (for partner tasks)
    employee_list = fetch_employees_from_supabase()

    # Exclude the current employee from potential partners
    potential_partners = [
        emp for emp in employee_list if emp.user_id != employee.user_id]

    # Ensure there are potential partners for pair tasks
    if not potential_partners:
        raise HTTPException(
            status_code=400, detail="No available partners for pair tasks")

    # Randomly choose one of the task types
    task_type = random.choice(["singular_fun", "pair_fun", "pair_work"])

    # Generate the task based on the selected type
    if task_type == "singular_fun":
        task = generate_singular_fun_task(employee)
    elif task_type == "pair_fun":
        partner_for_fun = get_fun_partner(employee, potential_partners)
        if not partner_for_fun:
            raise HTTPException(
                status_code=400, detail="No suitable partner found for pair fun task")
        task = generate_pair_fun_task(employee, partner_for_fun)
    else:  # "pair_work"
        partner_for_work = get_work_partner(employee, potential_partners)
        if not partner_for_work:
            raise HTTPException(
                status_code=400, detail="No suitable partner found for pair work task")
        task = generate_pair_work_task(employee, partner_for_work)

    # Save the generated task to Supabase
    save_task_to_supabase(task)

    # Return the generated task
    return {"generated_task": task}
