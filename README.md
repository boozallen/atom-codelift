# CodeLift for Atom.io

This extension allows you to send your currently open workspace to Codelift.io.
CodeLift will analyze your repository and build a Dockerfile for it.
It will then download the Dockerfile and other associated files into your current workspace.

To use the extension:
* Open the command palette with cmd-shift-p and type install packages.
* Search for CodeLift and click install.
* Push any pending commits to your Github repository.
* Either open the command palette and use the command 'createDockerfile' or
from the menu select Packages -> CodeLift -> Create Dockerfile.
* Log into CodeLift using your CodeLift email and password.
* Your repository will be analyzed by CodeLift and a Dockerfile will be created in your local repository.

### For more information
* CodeLift (https://codelift.io/)
