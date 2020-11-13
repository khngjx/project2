# Desired outcome
A push event in project2 repository will trigger
  * Whatsapp notification
  * Build and push image to DockerHub
  
# Steps and thought process 
  I created a workflow for each process by using seperate .YML file
  
  For Whatsapp notification, I followed the instructions at https://github.com/mdb571/wa-action. 
  Basically, I created a copy of the .yml file from https://github.com/mdb571/wa-action/blob/master/.github/workflows/main.yml. 
  After that, I had to create a Twilio account and input my PHONE NUMBER, ACCOUNT SID and AUTH TOKEN as secrets in GitHub. You can do this by clicking on "settings" on your repo.
  This is to protect data privacy. I was then required to link Twilio to my mobile phone.
  
  For building and pushing image to DockerHub, I combined the codes from https://docs.github.com/en/free-pro-team@latest/actions/guides/publishing-docker-images#publishing-images-to-docker-hub-and-github-packages and https://github.com/argoproj/argo/actions/runs/25949048/workflow. I had to create a dockerhub account after that and input my dockerhub username and access token as secret in the repository. 
  
  Every push will cause an image to be built and pushed into the DockerHub Repo : https://hub.docker.com/repository/docker/khngjx/project2
  
  
  
  
