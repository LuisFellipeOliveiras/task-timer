import React from 'react';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function TaskList({ tasks, activeTaskId, elapsed, onStart, onStop, onDelete }) {
  return (
    <div>
      {tasks.length === 0 && <p>Nenhuma tarefa criada ainda.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => {
          const isActive = task.id === activeTaskId;
          const total = isActive ? task.totalSeconds + elapsed : task.totalSeconds;

          return (
            <li
              key={task.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #ddd'
              }}
            >
              <div>
                <strong>{task.name}</strong><br />
                <small>Criada em: {new Date(task.createdAt).toLocaleString()}</small><br />
                <small>Duração total: {formatTime(total)}</small>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!isActive ? (
                  <button onClick={() => onStart(task.id)}>▶️ Iniciar</button>
                ) : (
                  <button onClick={onStop}>⏸️ Pausar</button>
                )}
                <button onClick={() => onDelete(task.id)} style={{ color: 'red' }}>🗑️</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
