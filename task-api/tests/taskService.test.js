const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create', () => {
    test('should create a task with default values', () => {
      const task = taskService.create({
        title: 'Learn Jest',
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Learn Jest');
      expect(task.description).toBe('');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.dueDate).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.createdAt).toBeDefined();
    });
  });

  describe('getAll', () => {
    test('should return all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('should return an empty array when there are no tasks', () => {
      expect(taskService.getAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    test('should find a task by id', () => {
      const created = taskService.create({
        title: 'Find me',
      });

      const task = taskService.findById(created.id);

      expect(task).toBeDefined();
      expect(task.id).toBe(created.id);
      expect(task.title).toBe('Find me');
    });

    test('should return undefined for an unknown id', () => {
      expect(taskService.findById('does-not-exist')).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    test('should return tasks matching the status', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const tasks = taskService.getByStatus('todo');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Todo task');
    });

    test('should return an empty array when no task matches', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      expect(taskService.getByStatus('done')).toEqual([]);
    });
  });

  describe('getPaginated', () => {
    test('should return the first page of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const tasks = taskService.getPaginated(1, 2);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('should return the second page of tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const tasks = taskService.getPaginated(2, 2);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Task 3');
    });
  });

  
  describe('getStats', () => {
    test('should return counts by status', () => {
      taskService.create({
        title: 'Todo task',
        status: 'todo',
      });

      taskService.create({
        title: 'In progress task',
        status: 'in_progress',
      });

      taskService.create({
        title: 'Done task',
        status: 'done',
      });

      const stats = taskService.getStats();

      expect(stats.todo).toBe(1);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
      expect(stats.overdue).toBe(0);
    });

    test('should count incomplete overdue tasks', () => {
      taskService.create({
        title: 'Overdue task',
        status: 'todo',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      taskService.create({
        title: 'Completed old task',
        status: 'done',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(1);
    });

    test('should return zero counts when there are no tasks', () => {
      const stats = taskService.getStats();

      expect(stats).toEqual({
        todo: 0,
        in_progress: 0,
        done: 0,
        overdue: 0,
      });
    });
  });

  describe('update', () => {
    test('should update an existing task', () => {
      const created = taskService.create({
        title: 'Original title',
      });

      const updated = taskService.update(created.id, {
        title: 'Updated title',
        priority: 'high',
      });

      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
      expect(updated.title).toBe('Updated title');
      expect(updated.priority).toBe('high');
    });

    test('should return null when updating an unknown id', () => {
      const result = taskService.update('does-not-exist', {
        title: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    test('should remove an existing task', () => {
      const created = taskService.create({
        title: 'Delete me',
      });

      const result = taskService.remove(created.id);

      expect(result).toBe(true);
      expect(taskService.findById(created.id)).toBeUndefined();
    });

    test('should return false when removing an unknown id', () => {
      const result = taskService.remove('does-not-exist');

      expect(result).toBe(false);
    });
  });

  describe('completeTask', () => {
    test('should mark an existing task as done', () => {
      const created = taskService.create({
        title: 'Complete me',
        status: 'todo',
        priority: 'high',
      });

      const completed = taskService.completeTask(created.id);

      expect(completed).toBeDefined();
      expect(completed.id).toBe(created.id);
      expect(completed.status).toBe('done');
      expect(completed.priority).toBe('medium');
      expect(completed.completedAt).toBeDefined();
    });

    test('should return null when completing an unknown id', () => {
      const result = taskService.completeTask('does-not-exist');

      expect(result).toBeNull();
    });
  });
});