import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import config from "./amplifyconfiguration.json";
import { createTodo, updateTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
Amplify.configure(config);

const client = generateClient();

function App() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const [isEdit, setIsEdit] = useState("");

  useEffect(() => {
    async function showList() {
      const result1 = await client.graphql({ query: listTodos });
      const list = result1?.data?.listTodos?.items;
      setList(list);
    }
    showList();
  }, []);

  async function createTodoItem() {
    try {
      if (!name.trim()) {
        return; 
      }
  
      const result = await client.graphql({
        query: createTodo,
        variables: {
          input: {
            name: name,
            description: "I will add later"
          },
        },
      });
  
      setList((prevList) => [...prevList, result.data.createTodo]);
      setName("");
    } catch (error) {
      console.error("Error", error);
    }
  }
  
  const deleteTodoItem = async (id) => {
    try {
      const result = await client.graphql({
        query: deleteTodo,
        variables: {
          input: {
            id: id,
          },
        },
      });

      setList((prevList) => prevList.filter((item) => item.id !== id));
      console.log(result);
    } catch (error) {
      console.error("Error", error);
    }
  };
  const updateTodoItem = async () => {
    try {
      const result = await client.graphql({
        query: updateTodo,
        variables: {
          input: {
            id: isEdit,
            name: name,
          },
        },
      });

      setList((prevList) =>
        prevList.map((item) =>
          item.id === isEdit ? { ...item, name: name } : item
        )
      );
      setIsEdit("");
      setName("");
      console.log(result);
    } catch (error) {
      console.error("error", error);
    }
  };
  const handleEdit = (element) => {
    setIsEdit(element.id);
    setName(element.name);
  };
  return (
    <div className="App">
      <div>
        <label>Add Todo </label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {!isEdit ? (
          <button type="button" onClick={createTodoItem}>
            Add Todo
          </button>
        ) : (
          <button type="button" onClick={updateTodoItem} className="">
            update Todo
          </button>
        )}
      </div>
      <ul className="list-type">
        <h1> Todo List</h1>
        {list && list.length > 0
          ? list.map((item) => (
              <div key={item.id} className="d-flex ">
                <li className="list">{item.name}</li>
                
                <button type="button" onClick={() => deleteTodoItem(item.id)} className="btn-btn">
                  Delete
                </button>
                <button type="button" onClick={() => handleEdit(item)} className="btn-btn">
                  Edit
                </button>
              </div>
            ))
          : "No Data Found"}
      </ul>
    </div>
  );
}

export default App;
