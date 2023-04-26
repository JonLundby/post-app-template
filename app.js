"use strict";

// ============== global variables ============== //
const endpoint = "https://test01-6591a-default-rtdb.europe-west1.firebasedatabase.app";
let posts;

// ============== load and init app ============== //

window.addEventListener("load", initApp);

function initApp() {
  updatePostsGrid(); // update the grid of posts: get and show all posts

  // event listener
  document.querySelector("#btn-create-post").addEventListener("click", showCreatePostDialog);
  document.querySelector("#create-post-form").addEventListener("submit", createPostClicked);

  document.querySelector("#form-delete-post").addEventListener("submit", deletePostClicked);
  document.querySelector(".btn-cancel").addEventListener("click", closeDialogDelete);
  
  document.querySelector("#update-post-form").addEventListener("submit", updatePostClicked);

  document.querySelector("#input-search").addEventListener("keyup", inputSearchChanged);
  document.querySelector("#input-search").addEventListener("search", inputSearchChanged);
}

// ============== events ============== //

function inputSearchChanged() {
  const value = this.value // alternatively use "event.target.value"
  const postsToShow = searchPosts(value);
  showPosts(postsToShow);
}

function searchPosts(searchValue) {
  searchValue = searchValue.toLowerCase();

  const results = posts.filter(checkTitle)

  function checkTitle(post) {
    const title = post.title.toLowerCase();
    return title.includes(searchValue);
  }

  return results;
}

function showCreatePostDialog(event) {
  console.log("Create New Post clicked!");
  event.preventDefault; //prevent page from being reloaded!

  document.querySelector("#create-post-dialog").showModal();
}

function createPostClicked(event) {
  const form = event.target; //or use "this"

  const title = form.title.value;
  const image = form.image.value;
  const body = form.body.value;

  createPost(title, image, body);

  form.reset();
  document.querySelector("#create-post-dialog").close();
}

function updatePostClicked() {
  const form = this;

  const title = form.title.value;
  const body = form.body.value;
  const image = form.image.value;
  const id = form.setAttribute("data-id");

  updatePost(id, title, body, image);
  document.querySelector("#update-post-dialog").close();
}

function deletePostClicked(event) {
  console.log("post-delete btn clicked");
  const id = event.target.getAttribute("data-id");
  deletePost(id);
}

function closeDialogDelete() {
  document.querySelector("#dialog-delete-post").close();
}

// todo

// ============== posts ============== //

async function updatePostsGrid() {
  posts = await getPosts(); // get posts from rest endpoint and save in global variable
  showPosts(posts); // show all posts (append to the DOM) with posts as argument
}

// Get all posts - HTTP Method: GET
async function getPosts() {
  const response = await fetch(`${endpoint}/posts.json`); // fetch request, (GET)
  const data = await response.json(); // parse JSON to JavaScript
  const posts = prepareData(data); // convert object of object to array of objects
  return posts; // return posts
}

function showPosts(listOfPosts) {
  document.querySelector("#posts").innerHTML = ""; // reset the content of section#posts

  for (const post of listOfPosts) {
    showPost(post); // for every post object in listOfPosts, call showPost
  }
}

function showPost(postObject) {
  const html = /*html*/ `
        <article class="grid-item">
            <img src="${postObject.image}" />
            <h3>${postObject.title}</h3>
            <p>${postObject.body}</p>
            <div class="btns">
                <button class="btn-delete">Delete</button>
                <button class="btn-update">Update</button>
            </div>
        </article>
    `; // html variable to hold generated html in backtick
  document.querySelector("#posts").insertAdjacentHTML("beforeend", html); // append html to the DOM - section#posts

  // add event listeners to .btn-delete and .btn-update
  document.querySelector("#posts article:last-child .btn-delete").addEventListener("click", deleteClicked);
  document.querySelector("#posts article:last-child .btn-update").addEventListener("click", updateClicked);

  // called when delete button is clicked
  function deleteClicked() {
    console.log("delete button clicked");
    // to do
    document.querySelector("#dialog-delete-title").textContent = postObject.title;
    document.querySelector("#form-delete-post").setAttribute("data-id", postObject.id);
    document.querySelector("#dialog-delete-post").showModal();
  }

  // called when update button is clicked
  function updateClicked() {
    console.log("Delete button clicked");
    // to do
    //refering to input name attribute
    document.querySelector("#update-post-form").title.value = postObject.title;
    document.querySelector("#update-post-form").body.value = postObject.body;
    document.querySelector("#update-post-form").image.value = postObject.image;
    //setting dataObjects id to form...?
    document.querySelector("#update-post-form").setAttribute("data-id", postObject.id);
    //showing modal
    document.querySelector("#update-post-dialog").showModal();
  }
}

// Create a new post - HTTP Method: POST
async function createPost(title, image, body) {
  // create new post object
  const newPost = {
    image: image,
    title: title,
    body: body,
  };

  // convert the JS object to JSON string
  const newPostToJSON = JSON.stringify(newPost);

  // POST fetch request with JSON in the body
  const response = await fetch(`${endpoint}/posts.json`, {
    method: "POST",
    body: newPostToJSON,
  });

  // check if response is ok - if the response is successful
  if (response.ok) {
    console.log("Post succesfully created! :)");
    updatePostsGrid();
  }
  // update the post grid to display all posts and the new post
}

// Update an existing post - HTTP Method: DELETE
async function deletePost(id) {
  // DELETE fetch request
  const respons = await fetch(`${endpoint}/posts/${id}.json`, { method: "DELETE" });

  // check if response is ok - if the response is successful
  // update the post grid to display posts
  if (respons.ok) {
    console.log("post was succesfully deleted!");
    updatePostsGrid();
  }
}

// Delete an existing post - HTTP Method: PUT
async function updatePost(id, title, body, image) {
  // post update to update
  const postToUpdate = {title, body, image}
  
  // convert the JS object to JSON string
  const postToUpdateJson = JSON.stringify(postToUpdate);

  // PUT fetch request with JSON in the body. Calls the specific element in resource
  const response = await fetch(`${endpoint}/posts/${id}.json`, { method: "PUT", body: postToUpdateJson });

  // check if response is ok - if the response is successful
  if (response.ok) {
    console.log("post updated succesfully!");
  }
  
  // update the post grid to display all posts and the new post
  updatePostsGrid();
}

// ============== helper function ============== //

// convert object of objects til an array of objects
function prepareData(dataObject) {
  const array = []; // define empty array
  // loop through every key in dataObject
  // the value of every key is an object
  for (const key in dataObject) {
    const object = dataObject[key]; // define object
    object.id = key; // add the key in the prop id
    array.push(object); // add the object to array
  }
  return array; // return array back to "the caller"
}
