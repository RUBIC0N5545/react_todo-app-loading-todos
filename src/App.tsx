/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { getTodos } from './api/todos';
import { Todo } from './types/Todo';
import { client } from './utils/fetchClient';

interface OnDblClickParams {
  index: number;
  todo: Todo;
}

type FilterType = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todosDb, setTodosDb] = useState<Todo[]>([]);
  const [todosToShow, setTodosToShow] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingTodoId, setLoadingTodoId] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');

  useEffect(() => {
    setTodosToShow(
      todosDb.filter(todo => {
        if (selectedFilter === 'all') {
          return true;
        }

        if (selectedFilter === 'active') {
          return !todo.completed;
        }

        return todo.completed;
      }),
    );
  }, [todosDb, selectedFilter]);

  useEffect(() => {
    // setLoading(true);
    const fetchTodos = async () => {
      try {
        setTodosDb(await getTodos());
      } catch (err) {
        setError('Unable to load todos');
        // console.error(error);
      } finally {
        // setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setError(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [error]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const deleteTodo = async (id: number) => {
    setLoadingTodoId(id);
    setError(null);
    try {
      await client.delete(`/todos/${id}`);
      setTodosDb(todosDb.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Unable to delete a todo');
    } finally {
      setLoadingTodoId(null);
    }
  };

  const completeTodo = async (id: number, completed: boolean) => {
    setLoadingTodoId(id);
    setError(null);
    try {
      await client.patch(`/todos/${id}`, { completed });
      setTodosDb(
        todosDb.map(todo => {
          if (todo.id === id) {
            return { ...todo, completed };
          }

          return todo;
        }),
      );
    } catch (err) {
      setError('Unable to update a todo');
    } finally {
      setLoadingTodoId(null);
    }
  };

  const updateTodo = async (id: number, title: string) => {
    setLoadingTodoId(id);
    setError(null);
    try {
      await client.patch(`/todos/${id}`, { title });
      setTodosDb(
        todosDb.map(todo => {
          if (todo.id === id) {
            return { ...todo, title };
          }

          return todo;
        }),
      );
    } catch (err) {
      setError('Unable to update a todo');
    } finally {
      setLoadingTodoId(null);
    }

    setEditValue('');
    setEditIndex(null);
  };

  const addTodo = async (title: string) => {
    setError(null);
    try {
      const todo = await client.post<Todo>('/todos', {
        title,
        completed: false,
      });

      setTodosDb([...todosDb, todo]);
      setNewTodoTitle('');
    } catch (err) {
      setError('Unable to add a todo');
    } finally {
    }
  };

  const onDblClick = ({ index, todo }: OnDblClickParams) => {
    setEditIndex(index);
    setEditValue(todo.title);
  };

  const clearCompleted = () => {
    // setLoadingTodoId(true);
    setError(null);
    try {
      const completedTodos = todosDb.filter(todo => todo.completed);
      const promises = completedTodos.map(todo =>
        client.delete(`/todos/${todo.id}`),
      );

      Promise.all(promises).then(() => {
        setTodosDb(todosDb.filter(todo => !todo.completed));
      });
    } catch (err) {
      setError('Unable to delete a todo');
    } finally {
      // setLoadingTodoId(false);
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={`todoapp__toggle-all ${todosDb.every(todo => todo.completed) ? 'active' : ''}`}
            data-cy="ToggleAllButton"
          />

          <form onSubmit={() => addTodo(newTodoTitle)}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodoTitle}
              onChange={e => setNewTodoTitle(e.target.value)}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {todosToShow.map((todo, index) => {
            return (
              <div
                data-cy="Todo"
                className={`todo ${todo.completed ? 'completed' : ''}`}
                key={todo.id}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                    onClick={() => completeTodo(todo.id, !todo.completed)}
                  />
                </label>

                {editIndex === index ? (
                  <form
                    onSubmit={() => updateTodo(todo.id, editValue)}
                    onBlur={() => updateTodo(todo.id, editValue)}
                  >
                    <input
                      data-cy="TodoTitleField"
                      type="text"
                      className="todo__title-field"
                      placeholder="Empty todo will be deleted"
                      onChange={e => setEditValue(e.target.value)}
                      value={editValue}
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <span
                      data-cy="TodoTitle"
                      className="todo__title"
                      onDoubleClick={() => onDblClick({ index, todo })}
                    >
                      {todo.title}
                    </span>
                    <button
                      type="button"
                      className="todo__remove"
                      data-cy="TodoDelete"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      ×
                    </button>
                  </>
                )}

                <div
                  data-cy="TodoLoader"
                  className={`modal overlay ${loadingTodoId === todo.id ? 'is-active' : ''}`}
                >
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            );
          })}
        </section>
        {todosDb.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todosDb.reduce((accumulator, value) => {
                return accumulator + (value.completed ? 0 : 1);
              }, 0)}{' '}
              items left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${selectedFilter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${selectedFilter === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => setSelectedFilter('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${selectedFilter === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => setSelectedFilter('completed')}
              >
                Completed
              </a>
            </nav>

            {todosDb.some(todo => todo.completed) && (
              <button
                type="button"
                className="todoapp__clear-completed hiden"
                data-cy="ClearCompletedButton"
                onClick={() => clearCompleted()}
              >
                Clear completed
              </button>
            )}
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${error ? '' : 'hidden'}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError(null)}
        />
        {error}
      </div>
    </div>
  );
};
