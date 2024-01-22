import React from "react";
import { Amplify } from "aws-amplify";
import config from "../amplifyconfiguration.json";
import { generateClient } from "aws-amplify/api";
import { createPost, createComment } from '../graphql/mutations';
import { getPost } from '../graphql/queries';

Amplify.configure(config);
const client = generateClient();

const Post = () => {
  const handleTaskAdd = async () => {
    try {
       
        const result1 = await client.graphql({
          query: createPost,
          variables: {
            input: { title: 'Hello World!!' }
          }
        });
        const post = result1.data.createPost;
        console.log(post,"postt")
        // create comment
        await client.graphql({
          query: createComment,
          variables: {
            input: { content: 'Hi!', postID: post.id }
          }
        });
        
        // get post
        const result = await client.graphql({
          query: getPost,
          variables: { id: post.id }
        });
        
        const postWithComments = result.data.createPost;
        console.log(postWithComments,"postWithCommentspostWithComments")
        const postComments = result.data.createComment;
        console.log(postComments,"postCommentspostComments+++++++++++++++++++++")
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <div>
      <button onClick={handleTaskAdd}>handleTaskAdd</button>
    </div>
  );
};

export default Post;
