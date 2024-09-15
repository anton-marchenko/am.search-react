import React, { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [throttledFilter, setThrottledFilter] = useState(filter);
  const throttleDelay = 200; // Устанавливаем задержку для throttle

  useEffect(() => {
    // Устанавливаем throttle
    const handler = setTimeout(() => {
      setThrottledFilter(filter);
    }, throttleDelay);

    return () => {
      clearTimeout(handler); // Очищаем таймаут при изменении фильтра
    };
  }, [filter]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Начинаем загрузку
      try {
        const response = await fetch(`https://your-backend-api.com/api/users?filter=${throttledFilter}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    if (throttledFilter.length >= 3) {
      fetchUsers();
    } else {
      setUsers([]); // Сбрасываем пользователей, если фильтр менее 3 символов
    }
  }, [throttledFilter]); // Используем throttledFilter для запроса

  const handleFilterChange = (event) => {
    setFilter(event.target.value); 
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div>
      **Список пользователей**
      <input 
        type="text" 
        placeholder="Введите имя для фильтрации" 
        value={filter} 
        onChange={handleFilterChange} 
      />
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li> 
        ))}
      </ul>
    </div>
  );
}

export default App;
