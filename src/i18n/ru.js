const ru = {
  brandName: "ONESIM Reseller",
  legalName: "ONESIM TRAVEL SOLUTIONS MChJ",
  nav: {
    dashboard: "Панель управления",
    catalog: "Тарифы eSIM",
    newOrder: "Новый заказ",
    groups: "Группы клиентов",
    orders: "Мои заказы",
    earnings: "Мой доход",
    settings: "Настройки"
  },
  common: {
    loading: "Загрузка...",
    empty: "Пока данных нет",
    retry: "Повторить",
    placeholder: "Эта страница будет заполнена на следующем этапе",
    search: "Поиск",
    save: "Сохранить",
    cancel: "Отмена",
    next: "Далее",
    back: "Назад",
    submit: "Подтвердить"
  },
  dashboard: {
    title: "Панель управления",
    subtitle: "Последняя активность и ключевые показатели",
    stats: {
      totalOrders: "Всего заказов",
      activeEsims: "Активные eSIM",
      totalEarnings: "Общий доход / Комиссия"
    },
    chartTitle: "Тренд за последние 7 дней",
    chartPlaceholder: "Здесь позже будет график",
    recentOrders: "Последние заказы",
    noOrders: "Последние заказы не найдены"
  },
  catalog: {
    title: "Тарифы eSIM",
    subtitle: "Выберите пакет для вашего клиента",
    filtersTitle: "Фильтры",
    filters: {
      destination: "Страна",
      locationType: "Тип покрытия",
      packageType: "Тип пакета",
      gb: "Объём интернета",
      days: "Срок (дни)",
      search: "Поиск по стране"
    },
    table: {
      package: "Название пакета",
      price: "Цена",
      data: "Объём трафика",
      validity: "Срок",
      speed: "Скорость",
      actions: "Действия"
    },
    units: {
      all: "Все",
      day: "дн.",
      days: "дней",
      unlimited: "Безлимит",
      country: "Одна страна",
      regional: "Региональный",
      global: "Глобальный",
      standard: "Стандартный",
      daily: "Дневной"
    },
    coverage: "Покрытие",
    details: "Подробнее",
    buy: "Купить",
    noPlans: "Тарифы по фильтру не найдены",
    resetFilters: "Сбросить фильтры",
    detailsModal: {
      title: "Детали пакета",
      packageInfo: "Информация о пакете",
      pricing: "Цены",
      b2cPrice: "Цена B2C",
      resellerPrice: "Цена партнера",
      yourDiscount: "Ваша скидка",
      coverage: "Зона покрытия",
      countriesCovered: "стран",
      operators: "Операторы",
      network: "Сеть",
      features: "Характеристики",
      dataOnly: "Только интернет",
      instantActivation: "Мгновенная активация",
      hotspotSupported: "Раздача Wi-Fi",
      topUpSupported: "Пополнение поддерживается",
      smsSupported: "SMS поддерживается",
      noSms: "Без SMS",
      data: "Объём данных",
      validity: "Срок действия",
      speed: "Скорость сети",
      packageType: "Тип пакета",
      packageCode: "Код пакета",
      locationType: "Тип покрытия",
      standard: "Стандартный",
      dailyUnlimited: "Безлимит / день",
      country: "Одна страна",
      regional: "Региональный",
      global: "Глобальный",
      description: "Описание",
      showAllCountries: "Показать все страны",
      hideCountries: "Скрыть",
    },
    modal: {
      title: "Оформление заказа",
      tabSelf: "Для себя",
      tabCustomer: "Для клиента",
      tabGroup: "Для группы",
      customers: "Клиенты",
      groups: "Группы",
      addCustomer: "Добавить клиента",
      addGroup: "Добавить группу",
      customerInfo: "Данные клиента",
      deliveryMethod: "Способ доставки",
      deliveryTime: "Дата и время доставки",
      deliveryInfo: "О доставке",
      paymentMethod: "Способ оплаты",
      selectGroup: "Выберите группу",
      select: "Выбрать",
      add: "Добавить",
      totalCustomers: "Итого",
      methods: {
        sms: "Через SMS",
        email: "Через Email",
        operator: "Через оператора"
      },
      timeModes: {
        now: "Сразу",
        scheduled: "Запланировать"
      },
      helperOperator:
        "Клиентам ничего отправляться не будет, вы можете распечатать все QR-коды и передать их самостоятельно",
      helperSelf:
        "Этот заказ eSIM не привязывается к клиенту. QR-код и ссылки для установки будут отправлены вам сразу. После оформления проверьте страницу Мои заказы.",
      labels: {
        fullName: "Имя Фамилия",
        phone: "+998",
        email: "Email адрес",
        date: "Дата",
        time: "Время"
      },
      summary: {
        packagePrice: "Цена пакета",
        partnerDiscount: "Партнерская скидка (5%)",
        partnerProfit: "Партнерская прибыль",
        total: "К оплате:"
      },
      cancel: "Отменить",
      confirm: "Подтвердить"
    }
  },
  order: {
    title: "Новый заказ",
    subtitle: "Подготовьте заказ eSIM для клиента в 3 шага",
    steps: {
      plan: "Выбор тарифа",
      mode: "Настройки заказа",
      checkout: "Завершение"
    },
    modeTitle: "Режим заказа",
    modes: {
      self: "Для себя",
      customer: "Для клиента",
      group: "Для группы"
    },
    fields: {
      customerName: "ФИО клиента",
      phone: "Номер телефона",
      email: "Email",
      group: "Группа",
      deliveryMethod: "Способ доставки",
      schedule: "Время отправки",
      scheduledAt: "Запланированное время"
    },
    delivery: {
      sms: "SMS",
      email: "Email",
      manual: "Вручную"
    },
    schedule: {
      now: "Отправить сейчас",
      later: "Запланировать"
    },
    summary: {
      title: "Итоги заказа",
      price: "Цена тарифа",
      discount: "Скидка",
      subtotal: "Промежуточная сумма",
      commission: "Комиссия",
      payment: "Способ оплаты",
      paymentValue: "Внутренний баланс"
    },
    create: "Создать заказ",
    creating: "Создание заказа...",
    success: "Заказ успешно создан",
    preselected: "Тариф из каталога применен автоматически",
    errors: {
      plan: "Для продолжения выберите тариф",
      customerName: "Имя клиента обязательно",
      phone: "Телефон обязателен для SMS",
      email: "Email обязателен для отправки",
      group: "Для группового режима выберите группу",
      schedule: "Для планирования укажите дату/время"
    }
  },
  status: {
    pending: "Ожидает",
    active: "Активен",
    expired: "Истек",
    failed: "Ошибка",
    not_activated: "Не активирован"
  },
  auth: {
    subtitle: "B2B Hamkorlik Portali",
    or: "Или",
    hero: {
      title: "Оставайтесь на связи по всему миру",
      subtitle:
        "Предоставляйте вашим клиентам лучшие eSIM услуги через портал партнерства OneSIM."
    },
    login: {
      title: "Вход в систему",
      description: "Введите данные вашей учетной записи для продолжения",
      signIn: "Войти",
      signingIn: "Вход...",
      forgotPassword: "Забыли пароль?",
      googleSignIn: "Войти через Google",
      noAccount: "Ещё не зарегистрированы?",
      signUp: "Зарегистрироваться"
    },
    signup: {
      title: "Регистрация",
      description: "Введите данные компании для становления партнером",
      register: "Зарегистрироваться",
      registering: "Регистрация...",
      companyInfo: "Информация о компании",
      contactPerson: "Контактное лицо",
      haveAccount: "Уже есть аккаунт?",
      signIn: "Войти",
      termsPrefix: "Нажимая «Зарегистрироваться», вы соглашаетесь с",
      terms: "Условиями использования",
      and: "и",
      privacy: "Политикой конфиденциальности"
    },
    fields: {
      email: "Email",
      password: "Пароль",
      passwordHelper: "Минимум 8 символов",
      companyName: "Название компании",
      legalName: "Официальное юридическое наименование",
      inn: "ИНН",
      address: "Адрес",
      contactFullName: "ФИО",
      contactPhone: "Телефон",
      contractNumber: "Договор-номер",
      contractHelper: "Опционально, будет присвоен после проверки",
      credentials: "Данные учётной записи",
      placeholders: {
        email: "name@company.com",
        password: "••••••••",
        companyName: "ООО «Пример»",
        legalName: "Общество с ограниченной ответственностью «Пример»",
        inn: "123456789",
        address: "г. Ташкент, ул. Примерная, д. 123",
        contactFullName: "Иванов Иван Иванович",
        contactPhone: "+998 90 123 45 67",
        contractNumber: "№ДОГ-2024-001"
      }
    },
    otp: {
      title: "Подтверждение Email",
      description: "Код подтверждения отправлен на:",
      verify: "Подтвердить",
      verifying: "Подтверждение...",
      creating: "Создание аккаунта...",
      noCode: "Не получили код?",
      resend: "Отправить повторно",
      resent: "Новый код отправлен!",
    },
    errors: {
      required: "Введите email и пароль",
      invalidCredentials: "Неверный email или пароль",
      emailNotConfirmed: "Email не подтвержден. Пожалуйста, проверьте почту.",
    },
  },
  pending: {
    title: "Панель управления",
    description: "Для полного доступа к платформе ваш бизнес-профиль должен быть одобрен администраторами. Администраторы уведомлены о вашей регистрации и в ближайшее время рассмотрят ваш профиль. Благодарим за понимание.",
    supportText: "По любым вопросам обращайтесь в службу поддержки:",
    supportPhone: "+998 93 514 98 08",
    cardTitle: "Данные регистрации компании",
    badge: "Ожидает одобрения",
    approvedTitle: "Ваш аккаунт одобрен администратором",
    approvedDescription: "Теперь вы можете пользоваться платформой полностью.",
    fields: {
      dateRegistered: "Дата регистрации",
      companyName: "Название компании",
      legalName: "Юридическое наименование",
      inn: "ИНН",
      address: "Адрес",
      businessEmail: "Бизнес email",
      contactPerson: "Контактное лицо",
      contactPhone: "Телефон",
      accountEmail: "Email аккаунта",
    },
    logout: "Выйти",
  }
};

export default ru;
