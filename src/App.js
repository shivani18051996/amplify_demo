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
  useEffect(() => {
    async function createTodoItem() {
      const result = await client.graphql({
        query: createTodo,
        variables: {
          input: {
            name: "My first todo!",
            description: "Hello World",
          },
        },
      });
      console.log(result, "resultsss");
    }
    createTodoItem();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Just Start with learning AWS-Amplify</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hello Amplify
        </a>
      </header>
    </div>
  );
}

export default App;
