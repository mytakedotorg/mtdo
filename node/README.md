# MyTake.org Node.js API server

## Dev quickstart

- `nvm use` to get the correct version of node and npm
- `./gradlew beforeCompile` (populates the `common` and `java2ts` directories of `src/main/scripts`)
- `npm start` to launch the server
    - if you change a file and save, it will automatically rebuild and restart the server
    - [13th Amendment](http://localhost:3000/api/images/o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA=_54-86_0-218.jpg)
    - [Mondale Reagan](http://localhost:3000/api/images/hNPKEqwAyuJdu2OQY6ESAieCq_xQXX1it4bjA7DRlIg=_5839.620-5949.290.png)
    - [broken link](http://localhost:3000/api/images/vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=_5839.620-5949.290.jpg)

## Managing the node app
Managing the app on the node.mytake.org server requires ssh access. See [server configuration](#server-configuration) for details.

### Git branches
For now there is only one remote production server without a staging environment. When developing a new feature you may be using a new git branch such as `feature/node`. When the server is tested and stable, you will likely be on `master`. Be sure the remote server is on the correct branch. For example, to check out a `feature/node` branch:

```
cd ~/mytakedotorg
git fetch
git checkout feature/node
```

### Deploying new code
If local development and testing is ready for the production environment, check all code into the working branch and push it up to GitHub. During an ssh session with node.mytake.org, run the `pull-and-restart.sh` script in the node user's home directory to pull the latest code and restart the node server. Verify your changes are live by navigating your browser to the proper node.mytake.org route.

If any packages have been added or removed from npm, you will need to manually update the `node_modules` folder with `cd ~/mytakedotorg/node && npm install`. After this step you'll need to run the `pull-and-restart.sh` script again.

## Server configuration
Steps outlined [here](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04) were used to create a user with administrator privileges that isn’t root. Username/password server authentication is disabled, so you have to add your ssh key to the `/home/node/.ssh/authorized_keys` file to login. You can do this from a root ssh session and then you should be able to `ssh node@node.mytake.org` afterwards. The node user's password is necessary for running sudo commands.

NGINX was installed and configured based on [this guide](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04). Nginx Full is enabled, which allows both HTTP and HTTPS connections.

[Server blocks](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-16-04) have not been setup. If we ever want to serve another subdomain from the same server, we will likely need to set up server blocks (virtual hosts).

Let’s Encrypt was used to configure SSL based on [this guide](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04). SSL certs should automatically renew. I used ned.twigg@mytake.org as the primary email address for certificate expiry notices.

To install and run a node server, [this guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04). This one also has useful process manager tips to start the node server when the physical server starts, to restart on failure, and to monitor CPU and memory usage.

Firewall rules allow OpenSSH and NGINX.

### pull-and-restart.sh

```
cd mytakedotorg
git pull
cd node
gulp build
pm2 restart server
```
