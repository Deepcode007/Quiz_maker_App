<h1>Live Quiz Platform</h1>
<br>
<h2>🚀 Project Overview</h2><br>
<h3>A real-time quiz application inspired by Mentimeter, enabling admins to create and manage quizzes while students participate live via WebSockets. This backend service handles user authentication, quiz management, and real-time interactions using Node.js and MongoDB.</h3>
<br><br>
<h2>✨ Key Features</h2>
<h3>Admin Capabilities:</h3>
<ul>
  <li>Create quizzes,</li>
  <li>add questions,</li>
  <li>initiate live sessions,</li>
  <li>show questions, and</li>
  <li>display results.</li>
</ul>
<h3>Student Capabilities: </h3>
<ul>
  <li>Join live quizzes,</li>
  <li>receive questions in real-time,</li>
  <li>submit answers,</li>
  <li>and see personal scores and overall results.</li>
</ul>
<h3>Real-Time Communication:</h3> <ul><li>Powered by WebSockets for seamless, instant updates.</li></ul>
<h3>Security:</h3> <ul>
  <li>JWT for authentication,</li>
  <li>bcrypt for password hashing,</li>
  <li>and Zod for schema validation.</li>
</ul>
<br>
<br>
<h2>
Tech Stack</h2>
<ul>
<h3>Backend:</h3> <li><h4>Node.js, Express.js</h4></li>
<h3>Database:</h3> <li>MongoDB with Mongoose</li>
<h3>Auth & Security:</h3> <li>JWT, bcrypt</li>
<h3>Validation & Real-Time:</h3> <li>Zod, WebSocket (ws)</li>
</ul>
<br></br>
<h2>🔌 WebSocket Integration</h2>
<h4>Connect via: <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace;">ws://localhost:3000/ws?token=&lt;JWT&gt;&amp;quizId=&lt;quizId&gt;</code></h4>

<p><h4>The system uses in-memory state to manage live quiz sessions, tracking users, questions, answers, and scores. Admins control the flow by starting quizzes, showing questions, and revealing results, while students submit answers and receive acknowledgments.
</h4></p>
<br>
<h3>Key Events</h3>
<table>
  <tr>
    <th>Role</th>
    <th>Events</th>
  </tr>
  <tr>
    <td>Admin</td>
    <td>START_QUIZ,<br>
    SHOW_QUESTION,<br>
    SHOW_RESULT</td>
  </tr>
  <tr>
    <td>Student</td>
    <td>SUBMIT_ANSWER</td>
  </tr>
</table>
<h3>The flow ensures validation at each step:</h3>
<ul><h4>
  <li>users connect and are added to the session;</li>
  <li>admins broadcast questions and results to all participants;</li>
  <li>students get immediate feedback on submissions, preventing duplicates and updating scores in real-time.</li>
  </h4>
</ul>
<h3>🛠️ Installation</h3>
<h4>Clone the repository:</h4>
<h5>Bash</h5>
`git clone https://github.com/Deepcode007live-quiz-platform.git
cd live-quiz-platform`
<h4>Install dependencies:</h4>
<h5>Bash</h5>
 `npm install`
<h4>Set up environment variables (e.g., .env file):</h4>
<p>MONGO_URI: MongoDB connection string
JWT_SECRET: Secret for JWT signing</p>
<h4>Run the server:</h4>
<h5>Bash</h5>
`npm start`
<br>
<h3>💡 Quick Tip:</h3>
<br>
Server runs on http://localhost:3000. Use Postman for API testing and wscat for WebSockets.
<h3>🎮 Usage</h3>
<ul>
  <li>Register as admin/student via the signup endpoint.</li>
  <li>Login to obtain a JWT token.</li>
  <li>Admins: Create and manage quizzes via API, then initiate and control live sessions over WebSocket.</li>
  <li>Students: Connect to the WebSocket with JWT and quiz ID to join and participate.</li>
</ul>
<h3>🤝 Contributing</h3>
<b>Contributions are welcome! Please fork the repo, create a feature branch, and submit a pull request with clear descriptions.</b>

<h3>📄 License</h3>
<h5>MIT License</h5>
