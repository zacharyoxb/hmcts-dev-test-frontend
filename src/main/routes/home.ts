import { Application, Request, Response } from 'express';
import axios from 'axios';

enum TaskStatus {
  NOT_COMPLETED = "NOT_COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  description?: string;
  dueDate: string;
}

interface TaskRequestBody {
  title: string;
  status: TaskStatus;
  description?: string;
  dueDate: string;
}

export default function (app: Application): void {
  app.get('/', async (req: Request, res: Response) => {
    res.render('home', {});
  });

  app.post('/create-task', async (req: Request, res: Response) => {
    try {
      const newTask: TaskRequestBody = {
        title: req.body.title || "New Task", 
        status: TaskStatus.IN_PROGRESS,
        description: req.body.description,
        dueDate: req.body.dueDate || new Date().toISOString()
      };

      const response = await axios.post<Task>('http://localhost:4000/tasks/create-task', newTask);

      const getStatusClass = (status: string): string => {
        const statusClasses: { [key: string]: string } = {
          'NOT_COMPLETED': 'govuk-tag--grey',
          'IN_PROGRESS': 'govuk-tag--blue',
          'COMPLETED': 'govuk-tag--green',
        };
        return statusClasses[status] || 'govuk-tag--grey';
      };

      const formatStatus = (status: string): string => {
        const statusStrings: {[key: string]: string} = {
          'NOT_COMPLETED': 'NOT COMPLETED',
          'IN_PROGRESS': 'IN PROGRESS',
          'COMPLETED': 'COMPLETED',
        }
        return statusStrings[status] || status
      }

      const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      };

      const task: Task = {
        id: response.data.id,
        title: response.data.title,
        status: response.data.status,
        description: response.data.description,
        dueDate: response.data.dueDate
      };

      res.render('home', { 
        task: task,
        getStatusClass: getStatusClass,
        formatStatus: formatStatus,
        formatDate: formatDate
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.render('home', { task: null });
    }
  });
}