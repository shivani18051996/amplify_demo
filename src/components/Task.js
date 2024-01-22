import React, { useEffect, useState } from "react";
import { Audio, ColorRing } from "react-loader-spinner";

import {
  createTask,
  createUser,
  deleteTask,
  deleteUser,
  updateTask,
  updateUser,
} from "../graphql/mutations";
import { listTasks, listUsers } from "../graphql/queries";
import { Amplify } from "aws-amplify";
import config from "../amplifyconfiguration.json";
import { generateClient } from "aws-amplify/api";

Amplify.configure(config);
const client = generateClient();

const Task = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState([]);
  const [user, setUser] = useState([]);
  const [userText, setUserText] = useState("");
  const [isEdit, setIsEdit] = useState({ userId: "", taskId: "" });

  useEffect(() => {
    async function showList() {
      setLoading(true);
      const result1 = await client.graphql({ query: listTasks });
      const list = result1?.data?.listTasks?.items;
      setTask(list);
      setLoading(false);
    }
    showList();
  }, []);

  useEffect(() => {
    async function showUserList() {
      const result1 = await client.graphql({ query: listUsers });
      setLoading(true);
      const list = result1?.data?.listUsers?.items;
      setUser(list);
      setLoading(false);
    }
    showUserList();
  }, []);

  const handleTaskAdd = async () => {
    try {
      if (!text.trim()) {
        return;
      }

      const taskResult = await client.graphql({
        query: createTask,
        variables: {
          input: {
            name: text,
            taskUserId: new Date().getTime(),
          },
        },
      });

      const taskData = taskResult.data.createTask;

      const userResult = await client.graphql({
        query: createUser,
        variables: {
          id: taskData.taskUserId,
          input: { name: userText, id: taskData.taskUserId },
        },
      });

      const userData = userResult.data.createUser;

      setTask((prevList) => [...prevList, taskData]);
      setUser((prevUsers) => [...prevUsers, userData]);

      setText("");
      setUserText("");
    } catch (error) {
      console.error("Error", error);
    }
  };

  const handleDelete = async (taskId, userId) => {
    try {
      await client.graphql({
        query: deleteTask,
        variables: {
          input: {
            id: taskId,
          },
        },
      });
      await client.graphql({
        query: deleteUser,
        variables: {
          input: {
            id: userId,
          },
        },
      });
      setTask((prevTasks) =>
        prevTasks.filter((task) => task.taskUserId !== taskId)
      );
      setUser((prevUsers) => prevUsers.filter((usr) => usr.id !== userId));
    } catch (error) {
      console.error("Error deleting task and user", error);
    }
  };

  const handleEdit = (task, user) => {
    setIsEdit({ userId: user.id, taskId: task.id });
    setText(task.name);
    setUserText(user.name);
  };

  const handleTaskUpdate = async () => {
    try {
      if (
        !text.trim() ||
        !userText.trim() ||
        !isEdit.taskId ||
        !isEdit.userId
      ) {
        return;
      }
      await client.graphql({
        query: updateTask,
        variables: {
          input: {
            id: isEdit.taskId,
            name: text,
            taskUserId: isEdit.userId,
          },
        },
      });
      await client.graphql({
        query: updateUser,
        variables: {
          id: isEdit.userId,
          input: {
            name: userText,
            id: isEdit.userId,
          },
        },
      });

      setTask((prevTasks) =>
        prevTasks.map((task) =>
          task.taskUserId === isEdit.userId ? { ...task, name: text } : task
        )
      );

      setUser((prevUsers) =>
        prevUsers.map((usr) =>
          usr.id === isEdit.userId ? { ...usr, name: userText } : usr
        )
      );
      setIsEdit({ userId: "", taskId: "" });
      setText("");
      setUserText("");
    } catch (error) {
      console.error("Error updating task and user", error);
    }
  };

  return (
    <div className="task-container">
      {loading &&
        task &&
        task.length &&
        user &&
        user.length &&(
          <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperClass="color-ring-wrapper"
            colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
          />
        )}
      <h2>Task Management</h2>
      <div className="task-input-container">
        <input
          type="text"
          onChange={(e) => setText(e.target.value)}
          value={text}
          placeholder="Enter Task Name"
        />
        <input
          type="text"
          onChange={(e) => setUserText(e.target.value)}
          value={userText}
          placeholder="Enter User Name"
        />
        {!isEdit.taskId && !isEdit.userId ? (
          <button type="button" onClick={handleTaskAdd}>
            Add Task and user
          </button>
        ) : (
          <button type="button" onClick={handleTaskUpdate}>
            Update Task and user
          </button>
        )}
      </div>
      <div className="combined-list-container">
        {task && task.length && user && user.length && !loading
          ? task.map((tsk) => {
              const matchingUser = user.find(
                (usr) => usr.id === tsk.taskUserId
              );
              return matchingUser ? (
                <div key={tsk.id} className="combined-item">
                  <span>{tsk.name}</span>
                  <span>{matchingUser.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tsk.id, matchingUser.id)}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(tsk, matchingUser)}
                  >
                    Edit
                  </button>
                </div>
              ) : null;
            })
          : "No Records found"}
      </div>
    </div>
  );
};

export default Task;
