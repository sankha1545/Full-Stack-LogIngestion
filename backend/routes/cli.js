const { exec } = require("child_process");

exports.execCommand = (req, res) => {
  const { command } = req.body;

  exec(command, { shell: "powershell.exe" }, (err, stdout, stderr) => {
    if (err) return res.json({ output: stderr || err.message });
    res.json({ output: stdout });
  });
};
