# MQTT Docker Setup Guide

---

## Prerequisites

### Install Docker Compose

In case you don't have docker-compose, you can install it:

```bash
sudo apt install docker-compose
```

---

## Setup Process

### Step 1: Run the Docker Container

Run the docker container for MQTT:

```bash
sudo docker-compose up -d
```

### Step 2: Verify Container Status

Check if the container is up and working (**note down container-id**):

```bash
sudo docker ps
```

---

## User Authentication Setup

### Create User/Password in pwfile

Access the container shell:

```bash
sudo docker exec -it  sh
```

Create the first user:

```bash
mosquitto_passwd -c /mosquitto/config/pwfile user1
```

Add additional users:

```bash
mosquitto_passwd /mosquitto/config/pwfile user2
```

Type `exit` to exit out of docker container prompt.

### Restart the Container

```bash
sudo docker restart
```

---

## Time to Test!!!

### Install Mosquitto Client Tools

Install mosquitto client tools for testing:

```bash
sudo apt install mosquitto-clients
```

### Test Subscription

```bash
mosquitto_sub -v -t 'hello/topic' -u user1 -P
```

---

## ⚠️ Important Note

**Change the port forward in the docker-compose file depending on what's needed, and enable the port in firewall also.**

---
