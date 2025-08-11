import { useEffect, useState } from "react";
import { FINES_API_BASE_URL } from "../services/apis";
import { useAuth } from "../AuthContext";

type Notice = { message: string; timestamp: string };

const Notifications: React.FC = () => {
  const { role,  memberId } = useAuth(); 
  const [notifications, setNotifications] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "member" || !memberId) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${FINES_API_BASE_URL}/api/notifications`, {
          headers: {
            Role: "member",
            "Member-Id": String(memberId),
          },
        });
        if (!res.ok) throw new Error("Failed to load notifications");
        const data: Notice[] = await res.json();
        data.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setNotifications(data);
      } catch (e) {
        console.error("Error fetching notifications:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const id = setInterval(fetchNotifications, 5000); 
    return () => clearInterval(id);
  }, [role, memberId]);
  if (role === "manager") {
    return (
      <div className="container">
        <div className="alert alert-info mt-3">
          Managers do not have notifications. Switch to a member to view
          their overdue notices.
        </div>
      </div>
    );
  }

  if (!memberId) {
    return (
      <div className="container">
        <div className="alert alert-warning mt-3">
          Please select a member to view their notifications.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">📢 Your Overdue Notifications</h2>

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="alert alert-success">No overdue notifications 🎉</div>
      ) : (
        <ul className="list-group">
          {notifications.map((n, i) => (
            <li
              key={`${n.timestamp}-${i}`}
              className="list-group-item d-flex align-items-start"
            >
              <span className="me-2">⚠️</span>
              <div>
                <div>{n.message}</div>
                <small className="text-muted">
                  {new Date(n.timestamp).toLocaleString()}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
