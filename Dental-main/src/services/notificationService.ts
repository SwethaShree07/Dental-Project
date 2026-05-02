import { toast } from 'sonner';

export const sendLocalNotification = (title: string, message: string) => {
  // In a real app, this would trigger a system push notification.
  // Here we use Sonner for visual feedback that a notification was "received".
  toast(title, {
    description: message,
    duration: 5000,
  });
};

export const scheduleReminder = (title: string, message: string, delayMs: number) => {
  setTimeout(() => {
    sendLocalNotification(title, message);
  }, delayMs);
};

export const simulateIncomingMessage = (sender: string) => {
    scheduleReminder(
        `New Message from ${sender}`, 
        "\"Hey, I have a quick question about my next appointment...\"", 
        3000
    );
};

export const simulateCheckupReminder = () => {
    scheduleReminder(
        "Checkup Alert", 
        "It's time for your 6-month cleaning! Book now to maintain your smile.", 
        10000
    );
};
