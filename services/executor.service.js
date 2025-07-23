import { exec } from "child_process";

const commandRunner = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout);
    });
  });

export default commandRunner;
