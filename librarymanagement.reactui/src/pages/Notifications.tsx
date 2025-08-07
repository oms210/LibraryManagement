import { useEffect, useState } from "react";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // refresh every 5 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h2 className="mb-4">📢 Overdue Notifications</h2>

      {notifications.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No overdue notifications at the moment.
        </div>
      ) : (
        <ul className="list-group">
          {notifications.map((msg, idx) => (
            <li
              key={idx}
              className="list-group-item list-group-item-warning d-flex align-items-center"
            >
              <span className="me-2">⚠️</span> {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
