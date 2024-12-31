import React from 'react';
import { Todo } from '../types/Todo';
import { FilterType } from '../types/FilterType';

type FooterProps = {
  todosDb: Todo[];
  selectedFilter: FilterType;
  setSelectedFilter: (filter: FilterType) => void;
  clearCompleted: () => void;
};

const Footer: React.FC<FooterProps> = ({
  todosDb,
  selectedFilter,
  setSelectedFilter,
  clearCompleted,
}) => {
  return (
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
  );
};

export default Footer;
