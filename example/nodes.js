import { createNode } from "./shared";
import randomColor from "randomcolor";

const getNumberAsync = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 500);
  });

export const colorNode = createNode("color", "#000", {
  next: () => randomColor()
});

export const counterNode = createNode("counter", 0, {
  increment: (state) => state + 1,
  set: (_, count) => count,
  incrementLazy: [
    getNumberAsync,
    (state, number) => {
      return state + number;
    }
  ],
  decrement: (state) => state - 1
});

const loadProfile = (id) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: "Edgar Post",
        age: 18
      });
    }, 2000);
  });

export const userNode = createNode(
  "user",
  { id: null, name: "", age: 0 },
  {
    load: [loadProfile, (_, profile) => profile],
    setName: (state, name) => ({ ...state, name }),
    anniversary: (state) => ({ ...state, age: state.age + 1 })
  }
);

let nextId = 4;

const createTodo = (title) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: nextId++, title });
    }, 2000);
  });

export const todoListNode = createNode(
  "todoList",
  [
    { id: 1, title: "Read book" },
    { id: 2, title: "Do the garden" },
    { id: 3, title: "Help out neighbor" }
  ],
  {
    add: [createTodo, (todos, todo) => [...todos, todo]],
    remove: (todos, id) => todos.filter((todo) => todo.id !== id),
    toggle: (todos, id) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
  }
);
