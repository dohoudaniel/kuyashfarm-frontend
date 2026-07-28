"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Notification } from "@/lib/types";

export function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for notification events
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>;
      const notification = customEvent.detail;

      setNotifications((prev) => [...prev, notification]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 5000);
    };

    window.addEventListener("kuyash-notification", handleNotification);

    return () => {
      window.removeEventListener("kuyash-notification", handleNotification);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 w-80">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onClose: () => void;
}

function NotificationCard({ notification, onClose }: NotificationCardProps) {
  const { type, title, message } = notification;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      textColor: "text-green-700",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      textColor: "text-red-700",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
      textColor: "text-amber-700",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      textColor: "text-blue-700",
    },
  };

  const style = config[type];
  const Icon = style.icon;

  return (
    <div
      className={`${style.bgColor} ${style.borderColor} border rounded-lg shadow-lg p-4 animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />

        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${style.titleColor}`}>{title}</h4>
          <p className={`text-sm ${style.textColor} mt-1`}>{message}</p>
        </div>

        <button
          onClick={onClose}
          className={`${style.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
