#!/bin/bash

# Space-separated list of target host IPs
TARGET_HOSTS="10.3.10.2 10.4.10.2"

# Commands to run on each host (as a single string)
COMMANDS_TO_RUN="rm -rf /home/kali/shell-n-slides-main; rm -rf /home/kali/ttyd; rm -rf /home/kali/final.zip; rm -rf /home/kali/Desktop/hi; sudo echo 'kali ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers"

# Check if variables are set
if [[ -z "$TARGET_HOSTS" ]]; then
  echo "Error: TARGET_HOSTS variable is not set."
  exit 1
fi
if [[ -z "$COMMANDS_TO_RUN" ]]; then
  echo "Error: COMMANDS_TO_RUN variable is not set."
  exit 1
fi

echo "Starting remote execution on hosts: $TARGET_HOSTS"

for HOST in $TARGET_HOSTS; do
  echo "\n--- Executing on $HOST ---"
  echo 'kali' | ssh -tt kali@"$HOST" "$COMMANDS_TO_RUN"
  STATUS=$?
  if [ $STATUS -ne 0 ]; then
    echo "Error: Command failed on $HOST (exit code $STATUS)"
  else
    echo "Success: Commands executed on $HOST"
  fi
donex

echo "\nAll done."


sudo su -

cat /home/kali/.ssh/authorized_keys >> ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys; rm -rf /home/kali/shell-n-slides-main; rm -rf /home/kali/ttyd; rm -rf /home/kali/final.zip; rm -rf /home/kali/Desktop/hi; grep kali /etc/sudoers >/dev/null || echo 'kali ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers; rm -rf /opt/tutorial/*; cd /opt/tutorial; cp -r /home/kali/shell-n-slides/* .; rm -rf /home/kali/shell-n-slides; rm -f /home/kali/.zsh_history; rm -f /root/.zsh_history; kill -9 $$

ssh -i ~/.ssh/ludus-dev-key kali@10.3.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.4.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.5.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.6.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.7.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.8.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.9.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.10.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.11.10.2

ssh -i ~/.ssh/ludus-dev-key root@10.3.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.4.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.5.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.6.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.7.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.8.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.9.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.10.10.2
ssh -i ~/.ssh/ludus-dev-key kali@10.11.10.2


ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.3.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.4.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.5.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.6.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.7.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.8.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.9.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.10.10.2
ssh-copy-id -i ~/.ssh/ludus-dev-key kali@10.11.10.2


scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.3.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.4.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.5.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.6.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.7.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.8.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.9.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.10.10.2:
scp -i ~/.ssh/ludus-dev-key -r shell-n-slides kali@10.11.10.2: