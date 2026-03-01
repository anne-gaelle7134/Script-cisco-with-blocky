function initNetworkCanvas() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODES = [];
  const COUNT = 18;
  for (let i = 0; i < COUNT; i++) {
    NODES.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 3 + 2,
      type: Math.random() > 0.6 ? 'router' : 'switch'
    });
  }
  const PACKETS = [];
  function spawnPacket() {
    const a = Math.floor(Math.random() * COUNT);
    let b = Math.floor(Math.random() * COUNT);
    while (b === a) b = Math.floor(Math.random() * COUNT);
    PACKETS.push({ from: a, to: b, t: 0, speed: 0.004 + Math.random() * 0.006 });
  }
  for (let i = 0; i < 5; i++) spawnPacket();
  setInterval(spawnPacket, 1800);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    NODES.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = NODES[i].x - NODES[j].x;
        const dy = NODES[i].y - NODES[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 220) {
          const alpha = (1 - dist / 220) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(NODES[i].x, NODES[i].y);
          ctx.lineTo(NODES[j].x, NODES[j].y);
          ctx.stroke();
        }
      }
    }

    NODES.forEach(n => {
      ctx.beginPath();
      if (n.type === 'router') {
        ctx.strokeStyle = 'rgba(0,245,255,0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      } else {
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(57,255,20,0.5)';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
      ctx.fillStyle = n.type === 'router' ? 'rgba(0,245,255,0.05)' : 'rgba(57,255,20,0.05)';
      ctx.fill();
    });

    for (let i = PACKETS.length - 1; i >= 0; i--) {
      const p = PACKETS[i];
      p.t += p.speed;
      if (p.t >= 1) { PACKETS.splice(i, 1); continue; }
      const from = NODES[p.from];
      const to   = NODES[p.to];
      const px = from.x + (to.x - from.x) * p.t;
      const py = from.y + (to.y - from.y) * p.t;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,0,144,0.9)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,0,144,0.2)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
}
let packetCount = 0;
function updatePacketCounter() {
  packetCount++;
  const el = document.getElementById('packet-counter');
  if (el) el.textContent = 'PKT: ' + String(packetCount).padStart(6, '0');
}
setInterval(updatePacketCounter, 400);

function initBlocks() {

  Blockly.Blocks['cisco_hostname'] = { init: function() {
    this.appendDummyInput().appendField("Définir le Hostname :").appendField(new Blockly.FieldTextInput("Router1"), "NAME");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }};

  Blockly.Blocks['config_ip'] = { init: function() {
    this.appendDummyInput().appendField("Interface").appendField(new Blockly.FieldTextInput("fa0/0"), "INT_NAME");
    this.appendStatementInput("COMMANDES").setCheck(null);
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }};

  Blockly.Blocks['IP'] = { init: function() {
    this.appendDummyInput().appendField("Définir une IP :").appendField(new Blockly.FieldTextInput("192.168.1.1"), "IP_VAL").appendField("Masque:").appendField(new Blockly.FieldTextInput("255.255.255.0"), "MASK_VAL");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(1);
    this.setTooltip("Définit l'IP et le masque");
  }};

  Blockly.Blocks['IPv6'] = { init: function() {
    this.appendDummyInput().appendField("Définir une IPv6 :").appendField(new Blockly.FieldTextInput("2001:db8:acad:1::1"), "IPv6_VAL").appendField("Masque:").appendField(new Blockly.FieldTextInput("/64"), "MASKv6_VAL");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(1);
    this.setTooltip("Définit l'IPv6 et le masque");
  }};

  Blockly.Blocks['link-local'] = { init: function() {
    this.appendDummyInput().appendField("Définir le link local:").appendField(new Blockly.FieldTextInput("fe80::1"), "link_local");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(1);
    this.setTooltip("Définit le link-local");
  }};

  Blockly.Blocks['mdp_priviliegie'] = { init: function() {
    this.appendDummyInput().appendField("Définir le Mdp de privilégié :").appendField(new Blockly.FieldTextInput("class"), "mdp_privi");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['mdp_line_console'] = { init: function() {
    this.appendDummyInput().appendField("Définir le mdp de la line console :").appendField(new Blockly.FieldTextInput("0"), "nbr_console").appendField(new Blockly.FieldTextInput("class"), "mdp_line_console");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['mdp_vty'] = { init: function() {
    this.appendDummyInput().appendField("Définir le mdp de la line vty :").appendField(new Blockly.FieldTextInput("0"), "nbr_commence_vty").appendField(new Blockly.FieldTextInput("4"), "nbr_fin_vty").appendField(new Blockly.FieldTextInput("class"), "mdp_vty");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['service_password_encryption'] = { init: function() {
    this.appendDummyInput().appendField("Chiffrer les mots de passe");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['banner_motd'] = { init: function() {
    this.appendDummyInput().appendField("Définir le banner motd :").appendField(new Blockly.FieldTextInput("Acces interdit !"), "banner_motd");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }};

  Blockly.Blocks['min_mdp'] = { init: function() {
    this.appendDummyInput().appendField("Définir la longueur min du mdp :").appendField(new Blockly.FieldTextInput("10"), "min_mdp");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['no_recherche_dns'] = { init: function() {
    this.appendDummyInput().appendField("Désactiver la recherche DNS");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }};

  Blockly.Blocks['interface_range'] = { init: function() {
    this.appendDummyInput().appendField("Interface range").appendField(new Blockly.FieldTextInput("fa0/1"), "INT_DEBUT").appendField(" - ").appendField(new Blockly.FieldTextInput("24"), "INT_FIN");
    this.appendStatementInput("COMMANDES").setCheck(null);
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }};

  Blockly.Blocks['descri_interface'] = { init: function() {
    this.appendDummyInput().appendField("Description :").appendField(new Blockly.FieldTextInput("Connexion_Serveur_RH"), "descri_interface");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }};

  Blockly.Blocks['shutdown'] = { init: function() {
    this.appendDummyInput().appendField("Désactiver l'interface (shutdown)");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }};

  Blockly.Blocks['duplex'] = { init: function() {
    this.appendDummyInput().appendField("Duplex :").appendField(new Blockly.FieldDropdown([["full","full"],["half","half"],["auto","auto"]]), "DUPLEX_VAL");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }};

  Blockly.Blocks['speed'] = { init: function() {
    this.appendDummyInput().appendField("Speed :").appendField(new Blockly.FieldDropdown([["10","10"],["100","100"],["1000","1000"],["auto","auto"]]), "SPEED_VAL");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }};

  Blockly.Blocks['ip_helper'] = { init: function() {
    this.appendDummyInput().appendField("IP Helper-address :").appendField(new Blockly.FieldTextInput("192.168.1.1"), "HELPER_IP");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
  }};

  Blockly.Blocks['ip_route'] = { init: function() {
    this.appendDummyInput().appendField("Route statique - Réseau :").appendField(new Blockly.FieldTextInput("192.168.2.0"), "RESEAU").appendField("Masque :").appendField(new Blockly.FieldTextInput("255.255.255.0"), "MASQUE").appendField("Next-hop :").appendField(new Blockly.FieldTextInput("10.0.0.1"), "NEXT_HOP");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(1);
  }};

  Blockly.Blocks['ip_default_gateway'] = { init: function() {
    this.appendDummyInput().appendField("IP Default-gateway :").appendField(new Blockly.FieldTextInput("192.168.1.1"), "GATEWAY");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(1);
  }};

  Blockly.Blocks['login_block'] = { init: function() {
    this.appendDummyInput().appendField("Bloquer login pendant (sec) :").appendField(new Blockly.FieldTextInput("120"), "DUREE").appendField("après (tentatives) :").appendField(new Blockly.FieldTextInput("3"), "TENTATIVES").appendField("dans (sec) :").appendField(new Blockly.FieldTextInput("60"), "FENETRE");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['exec_timeout'] = { init: function() {
    this.appendDummyInput().appendField("Exec-timeout (min) :").appendField(new Blockly.FieldTextInput("10"), "MINUTES").appendField("(sec) :").appendField(new Blockly.FieldTextInput("0"), "SECONDES");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['transport_ssh'] = { init: function() {
    this.appendDummyInput().appendField("Autoriser seulement SSH sur vty");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['crypto_rsa'] = { init: function() {
    this.appendDummyInput().appendField("Générer clé RSA (bits) :").appendField(new Blockly.FieldDropdown([["1024","1024"],["2048","2048"]]), "RSA_BITS");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['ip_domain_name'] = { init: function() {
    this.appendDummyInput().appendField("IP Domain-name :").appendField(new Blockly.FieldTextInput("cisco.com"), "DOMAIN");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['username_local'] = { init: function() {
    this.appendDummyInput().appendField("Créer utilisateur :").appendField(new Blockly.FieldTextInput("admin"), "USERNAME").appendField("Privilege :").appendField(new Blockly.FieldDropdown([["1","1"],["15","15"]]), "PRIVILEGE").appendField("Secret :").appendField(new Blockly.FieldTextInput("class"), "SECRET");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['login_local'] = { init: function() {
    this.appendDummyInput().appendField("Login local (utilisateurs locaux)");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['port_security'] = { init: function() {
    this.appendDummyInput().appendField("Activer port-security");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['port_security_max'] = { init: function() {
    this.appendDummyInput().appendField("Port-security maximum MAC :").appendField(new Blockly.FieldTextInput("2"), "MAX_MAC");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['port_security_violation'] = { init: function() {
    this.appendDummyInput().appendField("Port-security violation :").appendField(new Blockly.FieldDropdown([["shutdown","shutdown"],["restrict","restrict"],["protect","protect"]]), "VIOLATION");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['port_security_sticky'] = { init: function() {
    this.appendDummyInput().appendField("Port-security MAC sticky");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
  }};

  Blockly.Blocks['vlan_create'] = { init: function() {
    this.appendDummyInput().appendField("Créer VLAN :").appendField(new Blockly.FieldTextInput("10"), "VLAN_ID");
    this.appendStatementInput("COMMANDES").setCheck(null);
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
  }};

  Blockly.Blocks['vlan_name'] = { init: function() {
    this.appendDummyInput().appendField("Nommer le VLAN :").appendField(new Blockly.FieldTextInput("Comptabilite"), "VLAN_NAME");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
  }};

  Blockly.Blocks['vlan_interface'] = { init: function() {
    this.appendDummyInput().appendField("Interface VLAN :").appendField(new Blockly.FieldTextInput("10"), "VLAN_ID");
    this.appendStatementInput("COMMANDES").setCheck(null);
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
  }};

  Blockly.Blocks['switchport_access'] = { init: function() {
    this.appendDummyInput().appendField("Switchport mode access - VLAN :").appendField(new Blockly.FieldTextInput("10"), "VLAN_ID");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
  }};

  Blockly.Blocks['switchport_trunk'] = { init: function() {
    this.appendDummyInput().appendField("Switchport mode trunk - VLANs autorisés :").appendField(new Blockly.FieldTextInput("10,20,30"), "VLAN_LIST");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
  }};

  Blockly.Blocks['stp_portfast'] = { init: function() {
    this.appendDummyInput().appendField("Spanning-tree portfast");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
  }};

  Blockly.Blocks['switchport_nonegotiate'] = { init: function() {
    this.appendDummyInput().appendField("Switchport nonegotiate (désactiver DTP)");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
  }};

  Blockly.Blocks['dhcp_pool'] = { init: function() {
    this.appendDummyInput().appendField("DHCP Pool :").appendField(new Blockly.FieldTextInput("POOL_RH"), "POOL_NAME");
    this.appendDummyInput().appendField("Réseau :").appendField(new Blockly.FieldTextInput("192.168.1.0"), "RESEAU").appendField("Masque :").appendField(new Blockly.FieldTextInput("255.255.255.0"), "MASQUE");
    this.appendDummyInput().appendField("Default-router :").appendField(new Blockly.FieldTextInput("192.168.1.1"), "GATEWAY");
    this.appendDummyInput().appendField("DNS :").appendField(new Blockly.FieldTextInput("8.8.8.8"), "DNS");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(180);
  }};

  Blockly.Blocks['dhcp_excluded'] = { init: function() {
    this.appendDummyInput().appendField("Exclure IPs - De :").appendField(new Blockly.FieldTextInput("192.168.1.1"), "IP_DEBUT").appendField("À :").appendField(new Blockly.FieldTextInput("192.168.1.10"), "IP_FIN");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(180);
  }};

  Blockly.Blocks['save_config'] = { init: function() {
    this.appendDummyInput().appendField("💾 Sauvegarder la configuration");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
  }};

  Blockly.Blocks['router_ospf'] = { init: function() {
    this.appendDummyInput().appendField("Router OSPF - Process ID :").appendField(new Blockly.FieldTextInput("1"), "OSPF_ID").appendField("Router-ID :").appendField(new Blockly.FieldTextInput("1.1.1.1"), "ROUTER_ID");
    this.appendStatementInput("COMMANDES").setCheck(null);
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['ospf_network'] = { init: function() {
    this.appendDummyInput().appendField("Network OSPF :").appendField(new Blockly.FieldTextInput("192.168.1.0"), "RESEAU").appendField("Wildcard :").appendField(new Blockly.FieldTextInput("0.0.0.255"), "WILDCARD").appendField("Area :").appendField(new Blockly.FieldTextInput("0"), "AREA");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['ospf_passive'] = { init: function() {
    this.appendDummyInput().appendField("Passive-interface :").appendField(new Blockly.FieldTextInput("fa0/0"), "INTERFACE");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['router_rip'] = { init: function() {
    this.appendDummyInput().appendField("Router RIP v2");
    this.appendStatementInput("COMMANDES").setCheck(null);
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['rip_network'] = { init: function() {
    this.appendDummyInput().appendField("Network RIP :").appendField(new Blockly.FieldTextInput("192.168.1.0"), "RESEAU");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['ipv6_route'] = { init: function() {
    this.appendDummyInput().appendField("Route statique IPv6 :").appendField(new Blockly.FieldTextInput("2001:db8:acad:2::"), "RESEAU").appendField("Préfixe :").appendField(new Blockly.FieldTextInput("/64"), "PREFIXE").appendField("Next-hop :").appendField(new Blockly.FieldTextInput("2001:db8:acad:1::1"), "NEXT_HOP");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['ip_route_default'] = { init: function() {
    this.appendDummyInput().appendField("Route par défaut - Next-hop :").appendField(new Blockly.FieldTextInput("10.0.0.1"), "NEXT_HOP");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['nat_inside'] = { init: function() {
    this.appendDummyInput().appendField("IP NAT inside (interface interne)");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['nat_outside'] = { init: function() {
    this.appendDummyInput().appendField("IP NAT outside (interface externe)");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};

  Blockly.Blocks['nat_static'] = { init: function() {
    this.appendDummyInput().appendField("NAT statique - IP privée :").appendField(new Blockly.FieldTextInput("192.168.1.10"), "IP_PRIVEE").appendField("IP publique :").appendField(new Blockly.FieldTextInput("200.0.0.10"), "IP_PUBLIQUE");
    this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(20);
  }};
}
function initGenerators() {

  const G = javascript.javascriptGenerator;

  G.forBlock['cisco_hostname']             = (b)    => 'hostname ' + b.getFieldValue('NAME') + '\n';
  G.forBlock['IP']                         = (b)    => 'ip address ' + b.getFieldValue('IP_VAL') + ' ' + b.getFieldValue('MASK_VAL') + '\nno shutdown\n';
  G.forBlock['IPv6']                       = (b)    => 'ipv6 address ' + b.getFieldValue('IPv6_VAL') + b.getFieldValue('MASKv6_VAL') + '\n';
  G.forBlock['link-local']                 = (b)    => 'ipv6 address ' + b.getFieldValue('link_local') + ' link-local\n';
  G.forBlock['mdp_priviliegie']            = (b)    => 'enable secret ' + b.getFieldValue('mdp_privi') + '\n';
  G.forBlock['mdp_line_console']           = (b)    => 'line console ' + b.getFieldValue('nbr_console') + '\npassword ' + b.getFieldValue('mdp_line_console') + '\nlogin\nexit\n';
  G.forBlock['mdp_vty']                    = (b)    => 'line vty ' + b.getFieldValue('nbr_commence_vty') + ' ' + b.getFieldValue('nbr_fin_vty') + '\npassword ' + b.getFieldValue('mdp_vty') + '\nlogin\nexit\n';
  G.forBlock['service_password_encryption']= ()     => 'service password-encryption\n';
  G.forBlock['banner_motd']                = (b)    => 'banner motd #' + b.getFieldValue('banner_motd') + '#\n';
  G.forBlock['min_mdp']                    = (b)    => 'security password min-length ' + b.getFieldValue('min_mdp') + '\n';
  G.forBlock['no_recherche_dns']           = ()     => 'no ip domain-lookup\n';
  G.forBlock['descri_interface']           = (b)    => 'description ' + b.getFieldValue('descri_interface') + '\n';
  G.forBlock['shutdown']                   = ()     => 'shutdown\n';
  G.forBlock['duplex']                     = (b)    => 'duplex ' + b.getFieldValue('DUPLEX_VAL') + '\n';
  G.forBlock['speed']                      = (b)    => 'speed ' + b.getFieldValue('SPEED_VAL') + '\n';
  G.forBlock['ip_helper']                  = (b)    => 'ip helper-address ' + b.getFieldValue('HELPER_IP') + '\n';
  G.forBlock['ip_route']                   = (b)    => 'ip route ' + b.getFieldValue('RESEAU') + ' ' + b.getFieldValue('MASQUE') + ' ' + b.getFieldValue('NEXT_HOP') + '\n';
  G.forBlock['ip_default_gateway']         = (b)    => 'ip default-gateway ' + b.getFieldValue('GATEWAY') + '\n';
  G.forBlock['login_block']                = (b)    => 'login block-for ' + b.getFieldValue('DUREE') + ' attempts ' + b.getFieldValue('TENTATIVES') + ' within ' + b.getFieldValue('FENETRE') + '\n';
  G.forBlock['exec_timeout']               = (b)    => 'exec-timeout ' + b.getFieldValue('MINUTES') + ' ' + b.getFieldValue('SECONDES') + '\n';
  G.forBlock['transport_ssh']              = ()     => 'transport input ssh\n';
  G.forBlock['crypto_rsa']                 = (b)    => 'crypto key generate rsa modulus ' + b.getFieldValue('RSA_BITS') + '\n';
  G.forBlock['ip_domain_name']             = (b)    => 'ip domain-name ' + b.getFieldValue('DOMAIN') + '\n';
  G.forBlock['username_local']             = (b)    => 'username ' + b.getFieldValue('USERNAME') + ' privilege ' + b.getFieldValue('PRIVILEGE') + ' secret ' + b.getFieldValue('SECRET') + '\n';
  G.forBlock['login_local']                = ()     => 'login local\n';
  G.forBlock['port_security']              = ()     => 'switchport port-security\n';
  G.forBlock['port_security_max']          = (b)    => 'switchport port-security maximum ' + b.getFieldValue('MAX_MAC') + '\n';
  G.forBlock['port_security_violation']    = (b)    => 'switchport port-security violation ' + b.getFieldValue('VIOLATION') + '\n';
  G.forBlock['port_security_sticky']       = ()     => 'switchport port-security mac-address sticky\n';
  G.forBlock['vlan_name']                  = (b)    => 'name ' + b.getFieldValue('VLAN_NAME') + '\n';
  G.forBlock['switchport_access']          = (b)    => 'switchport mode access\nswitchport access vlan ' + b.getFieldValue('VLAN_ID') + '\n';
  G.forBlock['switchport_trunk']           = (b)    => 'switchport mode trunk\nswitchport trunk allowed vlan ' + b.getFieldValue('VLAN_LIST') + '\n';
  G.forBlock['stp_portfast']               = ()     => 'spanning-tree portfast\n';
  G.forBlock['switchport_nonegotiate']     = ()     => 'switchport nonegotiate\n';
  G.forBlock['dhcp_excluded']              = (b)    => 'ip dhcp excluded-address ' + b.getFieldValue('IP_DEBUT') + ' ' + b.getFieldValue('IP_FIN') + '\n';
  G.forBlock['save_config']                = ()     => 'copy running-config startup-config\n';
  G.forBlock['ospf_network']               = (b)    => 'network ' + b.getFieldValue('RESEAU') + ' ' + b.getFieldValue('WILDCARD') + ' area ' + b.getFieldValue('AREA') + '\n';
  G.forBlock['ospf_passive']               = (b)    => 'passive-interface ' + b.getFieldValue('INTERFACE') + '\n';
  G.forBlock['rip_network']                = (b)    => 'network ' + b.getFieldValue('RESEAU') + '\n';
  G.forBlock['ipv6_route']                 = (b)    => 'ipv6 route ' + b.getFieldValue('RESEAU') + b.getFieldValue('PREFIXE') + ' ' + b.getFieldValue('NEXT_HOP') + '\n';
  G.forBlock['ip_route_default']           = (b)    => 'ip route 0.0.0.0 0.0.0.0 ' + b.getFieldValue('NEXT_HOP') + '\n';
  G.forBlock['nat_inside']                 = ()     => 'ip nat inside\n';
  G.forBlock['nat_outside']                = ()     => 'ip nat outside\n';
  G.forBlock['nat_static']                 = (b)    => 'ip nat inside source static ' + b.getFieldValue('IP_PRIVEE') + ' ' + b.getFieldValue('IP_PUBLIQUE') + '\n';

  G.forBlock['config_ip']        = (b,g) => 'interface ' + b.getFieldValue('INT_NAME') + '\n' + g.statementToCode(b,'COMMANDES') + 'exit\n';
  G.forBlock['interface_range']  = (b,g) => 'interface range ' + b.getFieldValue('INT_DEBUT') + ' - ' + b.getFieldValue('INT_FIN') + '\n' + g.statementToCode(b,'COMMANDES') + 'exit\n';
  G.forBlock['vlan_create']      = (b,g) => 'vlan ' + b.getFieldValue('VLAN_ID') + '\n' + g.statementToCode(b,'COMMANDES') + 'exit\n';
  G.forBlock['vlan_interface']   = (b,g) => 'interface vlan ' + b.getFieldValue('VLAN_ID') + '\n' + g.statementToCode(b,'COMMANDES') + 'exit\n';
  G.forBlock['dhcp_pool']        = (b)   => 'ip dhcp pool ' + b.getFieldValue('POOL_NAME') + '\nnetwork ' + b.getFieldValue('RESEAU') + ' ' + b.getFieldValue('MASQUE') + '\ndefault-router ' + b.getFieldValue('GATEWAY') + '\ndns-server ' + b.getFieldValue('DNS') + '\nexit\n';
  G.forBlock['router_ospf']      = (b,g) => 'router ospf ' + b.getFieldValue('OSPF_ID') + '\nrouter-id ' + b.getFieldValue('ROUTER_ID') + '\n' + g.statementToCode(b,'COMMANDES') + 'exit\n';
  G.forBlock['router_rip']       = (b,g) => 'router rip\nversion 2\nno auto-summary\n' + g.statementToCode(b,'COMMANDES') + 'exit\n';
}

const TEMPLATES = {
  base_routeur: `<xml><block type="cisco_hostname" x="20" y="20"><field name="NAME">Router1</field><next><block type="no_recherche_dns"><next><block type="banner_motd"><field name="banner_motd">Acces interdit !</field><next><block type="mdp_priviliegie"><field name="mdp_privi">class</field><next><block type="mdp_line_console"><field name="nbr_console">0</field><field name="mdp_line_console">cisco</field><next><block type="mdp_vty"><field name="nbr_commence_vty">0</field><field name="nbr_fin_vty">4</field><field name="mdp_vty">cisco</field><next><block type="service_password_encryption"><next><block type="save_config"></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>`,
  base_switch:  `<xml><block type="cisco_hostname" x="20" y="20"><field name="NAME">Switch1</field><next><block type="no_recherche_dns"><next><block type="banner_motd"><field name="banner_motd">Acces interdit !</field><next><block type="mdp_priviliegie"><field name="mdp_privi">class</field><next><block type="ip_default_gateway"><field name="GATEWAY">192.168.1.1</field><next><block type="mdp_line_console"><field name="nbr_console">0</field><field name="mdp_line_console">cisco</field><next><block type="service_password_encryption"><next><block type="save_config"></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>`,
  ssh_complet:  `<xml><block type="cisco_hostname" x="20" y="20"><field name="NAME">Router1</field><next><block type="ip_domain_name"><field name="DOMAIN">cisco.com</field><next><block type="username_local"><field name="USERNAME">admin</field><field name="PRIVILEGE">15</field><field name="SECRET">class</field><next><block type="crypto_rsa"><field name="RSA_BITS">2048</field><next><block type="mdp_vty"><field name="nbr_commence_vty">0</field><field name="nbr_fin_vty">4</field><field name="mdp_vty">cisco</field></block></next></block></next></block></next></block></next></block></xml>`,
  vlan_complet: `<xml><block type="vlan_create" x="20" y="20"><field name="VLAN_ID">10</field><statement name="COMMANDES"><block type="vlan_name"><field name="VLAN_NAME">Comptabilite</field></block></statement><next><block type="vlan_create"><field name="VLAN_ID">20</field><statement name="COMMANDES"><block type="vlan_name"><field name="VLAN_NAME">Informatique</field></block></statement></block></next></block></xml>`,
  dhcp_complet: `<xml><block type="dhcp_excluded" x="20" y="20"><field name="IP_DEBUT">192.168.1.1</field><field name="IP_FIN">192.168.1.10</field><next><block type="dhcp_pool"><field name="POOL_NAME">POOL_LAN</field><field name="RESEAU">192.168.1.0</field><field name="MASQUE">255.255.255.0</field><field name="GATEWAY">192.168.1.1</field><field name="DNS">8.8.8.8</field></block></next></block></xml>`
};

function chargerTemplate(nom) {
  if (!TEMPLATES[nom]) return;
  if (workspace.getAllBlocks().length > 0 && !confirm('Remplacer les blocs actuels ?')) return;
  workspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(TEMPLATES[nom]), workspace);
}

let workspace;

function afficherLeCode() {
  const G = javascript.javascriptGenerator;
  var code = G.workspaceToCode(workspace);
  var erreurs = [], validations = [];

  var ips = (code.match(/\b(\d{1,3}\.){3}\d{1,3}\b/g) || []);
  ips.forEach(ip => {
    if (ip.split('.').some(p => parseInt(p) > 255))
      erreurs.push('⚠ IP invalide : ' + ip);
  });

  var seen = [];
  (code.match(/ip address \S+/g) || []).forEach(l => {
    var ip = l.split(' ')[2];
    if (seen.includes(ip)) erreurs.push('⚠ IP en doublon : ' + ip);
    else seen.push(ip);
  });

  if (code.includes('crypto key generate rsa')) {
    if (!code.includes('ip domain-name'))
      erreurs.push("⚠ crypto RSA : il manque 'ip domain-name' !");
    if (!code.includes('hostname ') || code.includes('hostname Router1\n'))
      erreurs.push("⚠ crypto RSA : hostname doit être personnalisé !");
    else
      validations.push('✔ SSH : hostname OK');
  }
  if (code.includes('transport input ssh') && !code.includes('crypto key generate rsa'))
    erreurs.push("⚠ SSH : il manque le bloc 'Clé RSA' !");
  if (code.includes('login local') && !code.includes('username '))
    erreurs.push("⚠ login local : aucun utilisateur créé !");
  if (code.includes('switchport port-security') && !code.includes('switchport mode access'))
    erreurs.push("⚠ Port-security : interface doit être en mode access !");

  var de = document.getElementById('erreurs');
  de.innerHTML = erreurs.join('<br>'); de.style.display = erreurs.length ? 'block' : 'none';
  var dv = document.getElementById('validations');
  dv.innerHTML = validations.join(' | '); dv.style.display = validations.length ? 'block' : 'none';

  if (code) {
    code = code.replaceAll('enable\n','').replaceAll('config t\n','');
    code = (code.includes('ipv6') ? 'enable\nconfig t\nipv6 unicast-routing\n' : 'enable\nconfig t\n') + code + 'end\n';
  }

  var out = document.getElementById('codeOutput');
  if (!code.trim()) { out.innerHTML = '<span style="color:var(--text-dim)">// Glisse des blocs pour générer ton script...</span>'; return; }
  out.innerHTML = code.split('\n').map((l, i) =>
    `<div class="code-line"><span class="line-num">${i+1}</span><span>${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span></div>`
  ).join('');
}

function sauvegarderWorkspace() {
  var xml = Blockly.utils.xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([xml], {type:'text/xml'}));
  a.download = 'cisco_workspace.xml'; a.click();
}

function telechargerScript() {
  var code = javascript.javascriptGenerator.workspaceToCode(workspace);
  if (!code.trim()) { alert('Génère d\'abord un script !'); return; }
  code = code.replaceAll('enable\n','').replaceAll('config t\n','');
  code = (code.includes('ipv6') ? 'enable\nconfig t\nipv6 unicast-routing\n' : 'enable\nconfig t\n') + code + 'end\n';
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([code], {type:'text/plain'}));
  a.download = 'script_cisco.txt'; a.click();
}

function copierLeCode() {
  var code = javascript.javascriptGenerator.workspaceToCode(workspace);
  if (!code.trim()) { alert('Génère d\'abord un script !'); return; }
  code = code.replaceAll('enable\n','').replaceAll('config t\n','');
  code = (code.includes('ipv6') ? 'enable\nconfig t\nipv6 unicast-routing\n' : 'enable\nconfig t\n') + code + 'end\n';
  navigator.clipboard.writeText(code).then(() => alert('✅ Script copié !')).catch(() => alert('❌ Erreur copie !'));
}

function reinitialiser() {
  if (confirm('Effacer tous les blocs ?')) {
    workspace.clear();
    document.getElementById('codeOutput').innerHTML = '<span style="color:var(--text-dim)">// Glisse des blocs pour générer ton script...</span>';
    document.getElementById('erreurs').style.display = 'none';
    document.getElementById('validations').style.display = 'none';
  }
}

window.onload = function() {
  initNetworkCanvas();
  initBlocks();
  initGenerators();

  workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    theme: Blockly.Theme.defineTheme('cyberTheme', {
      base: Blockly.Themes.Classic,
      componentStyles: {
        workspaceBackgroundColour: '#020b18',
        toolboxBackgroundColour:   '#071428',
        toolboxForegroundColour:   '#7ab3cc',
        flyoutBackgroundColour:    '#040f1f',
        flyoutForegroundColour:    '#e8f4fd',
        flyoutOpacity: 1,
        scrollbarColour: '#0099aa',
      }
    }),
    grid: { spacing: 24, length: 3, colour: 'rgba(0,245,255,0.05)', snap: true },
    zoom: { controls: true, wheel: true, startScale: 0.9 },
    trashcan: true,
    sounds: false,
  });

  workspace.addChangeListener(function(e) {
    if (e.type !== Blockly.Events.UI) afficherLeCode();
  });
};
