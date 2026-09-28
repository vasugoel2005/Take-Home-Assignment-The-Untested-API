const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks', () => {
    test('should return all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const response = await request(app)
        .get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[1].title).toBe('Task 2');
    });

    test('should return an empty array when there are no tasks', async () => {
      const response = await request(app)
        .get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /tasks?status=', () => {
    test('should return tasks filtered by status', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'todo' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Todo task');
    });

    test('should return an empty array when no task matches', async () => {
      const response = await request(app)
        .get('/tasks')
        .query({ status: 'done' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /tasks/stats', () => {
    test('should return task statistics', async () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body.todo).toBe(1);
      expect(response.body.done).toBe(1);
      expect(response.body.in_progress).toBe(0);
      expect(response.body.overdue).toBe(0);
    });
  });

  describe('POST /tasks', () => {
    test('should create a new task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'New task',
          description: 'Test description',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New task');
      expect(response.body.description).toBe('Test description');
      expect(response.body.priority).toBe('high');
      expect(response.body.status).toBe('todo');
      expect(response.body.id).toBeDefined();
    });

    test('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          description: 'No title',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should return 400 for an invalid status', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Invalid task',
          status: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /tasks/:id', () => {
    test('should update an existing task', async () => {
      const task = taskService.create({
        title: 'Original task',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: 'Updated task',
          priority: 'high',
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(task.id);
      expect(response.body.title).toBe('Updated task');
      expect(response.body.priority).toBe('high');
    });

    test('should return 404 for an unknown task', async () => {
      const response = await request(app)
        .put('/tasks/does-not-exist')
        .send({
          title: 'Updated task',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('should return 400 for an invalid title', async () => {
      const task = taskService.create({
        title: 'Original task',
      });

      const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
          title: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('should delete an existing task', async () => {
      const task = taskService.create({
        title: 'Delete me',
      });

      const response = await request(app)
        .delete(`/tasks/${task.id}`);

      expect(response.status).toBe(204);
      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('should return 404 for an unknown task', async () => {
      const response = await request(app)
        .delete('/tasks/does-not-exist');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('should complete an existing task', async () => {
      const task = taskService.create({
        title: 'Complete me',
        status: 'todo',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(task.id);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).toBeDefined();
    });

    test('should return 404 for an unknown task', async () => {
      const response = await request(app)
        .patch('/tasks/does-not-exist/complete');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('GET /tasks pagination', () => {
    test('should return paginated tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const response = await request(app)
        .get('/tasks')
        .query({
          page: 1,
          limit: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });
    describe('PATCH /tasks/:id/assign', () => {
    test('should assign a task to a user', async () => {
      const task = taskService.create({
        title: 'Assign me',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: 'Vasu',
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(task.id);
      expect(response.body.assignee).toBe('Vasu');
    });

    test('should return 404 when the task does not exist', async () => {
      const response = await request(app)
        .patch('/tasks/does-not-exist/assign')
        .send({
          assignee: 'Vasu',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('should return 400 when assignee is empty', async () => {
      const task = taskService.create({
        title: 'Assign me',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should trim whitespace from assignee', async () => {
      const task = taskService.create({
        title: 'Assign me',
      });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: '  Vasu  ',
        });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Vasu');
    });

    test('should allow reassignment of an already assigned task', async () => {
      const task = taskService.create({
        title: 'Reassign me',
      });

      await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: 'Vasu',
        });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
          assignee: 'Rahul',
        });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Rahul');
    });
  });
});