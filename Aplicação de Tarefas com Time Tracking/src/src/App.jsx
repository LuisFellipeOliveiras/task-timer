import React, { useState, useEffect, useRef } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const LOCAL_STORAGE_KEY = 'timeTracker.tasks';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (activeTaskId === null) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [activeTaskId]);

  function handleAddTask(name) {
    const newTask = {
      id: Date.now().toString(),
      name,
      totalSeconds: 0,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  }

  function handleStart(taskId) {
    if (activeTaskId !== null && activeTaskId !== taskId) {
      handleStop();
    }
    setActiveTaskId(taskId);
    setElapsed(0);
  }

  function handleStop() {
    setTasks(prev =>
      prev.map(task =>
        task.id === activeTaskId
          ? { ...task, totalSeconds: task.totalSeconds + elapsed }
          : task
      )
    );
    setActiveTaskId(null);
    setElapsed(0);
    clearInterval(timerRef.current);
  }

  function handleDelete(taskId) {
    if (activeTaskId === taskId) {
      handleStop();
    }
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }

  return (
    <div style={{ maxWidth: 700, margin: 'auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Time Tracker - Lipe</h1>
      <TaskForm onAdd={handleAddTask} />
      <TaskList
        tasks={tasks}
        activeTaskId={activeTaskId}
        elapsed={elapsed}
        onStart={handleStart}
        onStop={handleStop}
        onDelete={handleDelete}
      />
    </div>
  );
}
