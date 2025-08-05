## TO do items

index.html -> Change the http://10.11.10.2:7681"

Ludus hype of other challenges as final slides - emux


floating - kali/revert-camera
kali/revert-all

Make it work with a screen resolution of 1366 x 768 (Dell Latitude 5480) or 1920 x 1080









BSides LV Setup

Router:

- Drop ICMP packets on input
    - iptables -I INPUT -p icmp -j DROP
    - iptables -I LUDUS_DEFAULTS -s 198.51.100.2 -j ACCEPT

Kali:
- allow passwordless sudo
    - sudo echo 'kali ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
- alias nmap to nmap --disable-arp-ping (meh, just put it in the command)
    - echo "alias nmap='nmap --disable-arp-ping'" >> /home/kali/.zshrc
    - sudo echo "alias nmap='nmap --disable-arp-ping'" >> /root/.zshrc
