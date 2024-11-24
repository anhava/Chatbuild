export const strings = {
  common: {
    close: 'Sulje',
    error: 'Virhe',
    success: 'Onnistui',
    loading: 'Ladataan...',
    save: 'Tallenna',
    cancel: 'Peruuta',
    delete: 'Poista',
    edit: 'Muokkaa',
    create: 'Luo uusi',
  },

  notifications: {
    title: 'Ilmoitukset',
    closeNotification: 'Sulje ilmoitus',
    errorIcon: 'Virhe-kuvake',
    closeIcon: 'Sulje-kuvake',
  },

  chat: {
    title: 'Keskustelu',
    open: 'Avaa keskustelu',
    close: 'Sulje keskustelu',
    status: {
      online: 'Yhdistetty',
      offline: 'Ei yhteyttä',
      connecting: 'Yhdistetään...',
      busy: 'Varattu',
      away: 'Poissa',
    },
    widget: {
      toggle: {
        open: 'Avaa keskustelu',
        close: 'Sulje keskustelu',
      },
      minimize: 'Pienennä keskustelu',
      maximize: 'Suurenna keskustelu',
    },
    connectionError: {
      title: 'Yhteysvirhe',
      description: 'Yhteyden muodostaminen keskustelupalvelimeen epäonnistui',
    },
    sessionStarted: {
      title: 'Keskustelu aloitettu',
      description: 'Sinut on yhdistetty keskusteluhuoneeseen',
    },
    sessionEnded: {
      title: 'Keskustelu päättynyt',
      description: 'Keskusteluistunto on päättynyt',
    },
    createRoomError: {
      title: 'Virhe',
      description: 'Keskusteluhuoneen luominen epäonnistui',
    },
    typing: 'kirjoittaa...',
    sendMessage: 'Lähetä viesti',
    placeholder: 'Kirjoita viestisi tähän...',
    noMessages: 'Ei viestejä',
    messageCount: 'viestejä yhteensä',
    lastMessage: 'Viimeisin viesti',
    newMessage: 'Uusi viesti',
    loadMore: 'Lataa lisää',
    scrollToBottom: 'Vieritä alas',
    messageDeleted: 'Viesti poistettu',
    messageEdited: 'Muokattu',
    messageCopied: 'Viesti kopioitu',
    fileUpload: {
      title: 'Tiedoston lähetys',
      button: 'Lähetä tiedosto',
      dragDrop: 'Vedä ja pudota tiedosto tähän',
      or: 'tai',
      browse: 'Selaa tiedostoja',
      maxSize: 'Maksimikoko:',
      invalidType: 'Virheellinen tiedostotyyppi',
      uploadError: 'Tiedoston lähetys epäonnistui',
      uploading: 'Lähetetään...',
    },
  },

  dashboard: {
    title: 'Hallintapaneeli',
    sections: {
      overview: 'Yleiskatsaus',
      chatbots: 'Chatbotit',
      files: 'Tiedostot',
      settings: 'Asetukset',
    },
    stats: {
      totalMessages: 'Viestit yhteensä',
      totalFiles: 'Tiedostot yhteensä',
      totalLinks: 'Linkit yhteensä',
    },
  },

  chatbot: {
    creation: {
      title: 'Luo uusi chatbot',
      name: 'Chatbotin nimi',
      description: 'Kuvaus',
      welcomeMessage: 'Tervetuloviesti',
      themeColor: 'Teemaväri',
      logo: 'Logo',
      logoHelp: 'Suositus: Neliön muotoinen kuva, vähintään 100x100px',
    },
    settings: {
      title: 'Chatbotin asetukset',
      general: 'Yleiset asetukset',
      appearance: 'Ulkoasu',
      integration: 'Integraatio',
    },
    status: {
      active: 'Aktiivinen',
      inactive: 'Ei aktiivinen',
      deleted: 'Poistettu',
    },
  },

  errors: {
    general: 'Tapahtui virhe. Yritä uudelleen.',
    notFound: 'Sivua ei löytynyt',
    unauthorized: 'Ei käyttöoikeutta',
    validation: 'Tarkista syöttämäsi tiedot',
    fileUpload: 'Tiedoston lähetys epäonnistui',
    maxFilesReached: 'Tiedostojen maksimimäärä saavutettu',
    maxMessagesReached: 'Viestien maksimimäärä saavutettu',
    subscriptionRequired: 'Vaatii tilauksen',
  },

  subscription: {
    plans: {
      free: 'Ilmainen',
      pro: 'Pro',
      premium: 'Premium',
      enterprise: 'Enterprise',
    },
    features: {
      messages: 'viestiä',
      files: 'tiedostoa',
      webPages: 'verkkosivua',
      liveChat: 'Live-chat',
      customBranding: 'Mukautettu brändi',
      support: {
        email: 'Sähköpostituki',
        priority: 'Prioriteettituki',
        priorityPhone: 'Prioriteettituki puhelimitse',
      },
    },
    billing: {
      monthly: 'kk',
      yearly: 'vuosi',
      current: 'Nykyinen tilaus',
      upgrade: 'Päivitä tilaus',
      cancel: 'Peruuta tilaus',
    },
  },
};
