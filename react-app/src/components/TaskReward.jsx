import React, { useState } from 'react';
import TaskList from './TaskList';
import MilestoneTracker from './MilestoneTracker';

const TaskReward = () => {
    const [userPoints, setUserPoints] = useState(0); // Lift userPoints state to the parent component

    return (
        <div>
            {/* Pass setUserPoints and userPoints as props */}
            <MilestoneTracker userPoints={userPoints} />

            <TaskList setUserPoints={setUserPoints} />
        </div>
    );
};

export default TaskReward;