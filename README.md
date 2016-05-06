# Codelift for Atom.io

This extension allows you to send your currently open wrokspace to Codelift.io.
Codelift will analyze your repository and build a Dockerfile for it.
It will then download the Dockerfile and other associated files in a timestamped folder
in your current workspace.

To use the extension
* Open the command palette with cmd-shift-p and type install packages
* Search for Codelift and click install
* Push any pending commits to your Github repository
* Either open the command palette and use the command 'createDockerfile' or
from the menu select Packages -> Codelift -> Create Dockerfile
* Log into Codelift using your Codelift email and password
* Your repository will be analyzed by Codelift and a Dockerfile will be created in your local repository
...

### For more information
* Codelift (https://codelift.io/)
