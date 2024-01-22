// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Todo, task, User, Post, Comment } = initSchema(schema);

export {
  Todo,
  task,
  User,
  Post,
  Comment
};