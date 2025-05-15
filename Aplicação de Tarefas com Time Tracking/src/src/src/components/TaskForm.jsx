import React, { useState } from 'react';

export default function TaskForm({ onAdd }) {
  const [taskName, setTaskName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!taskName.trim()) return;
    onAdd(taskName.trim());
    setTaskName('');
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
      <input
        type="text"
        placeholder="Nome da tarefa"
        value={taskName}
        onChange={e => setTaskName(e.target.value)}
        style={{ flex: 1, padding: 8, fontSize: 16 }}
      />
      <button type="submit" style={{ padding: '8px 16px', fontSize: 16 }}>Adicionar</button>
    </form>
  );
}
