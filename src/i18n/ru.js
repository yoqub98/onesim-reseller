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
      gb: "Объем интернета",
      days: "Срок действия (дни)",
      search: "Поиск по плану или стране"
    },
    table: {
      package: "Название пакета",
      price: "Цена",
      validity: "Срок",
      speed: "Скорость",
      actions: "Действия"
    },
    units: {
      all: "Все",
      day: "дн.",
      days: "дней",
      unlimited: "Безлимит"
    },
    coverage: "Покрытие",
    details: "Подробнее",
    buy: "Купить",
    noPlans: "Тарифы по фильтру не найдены",
    resetFilters: "Сбросить фильтры",
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
  }
};

export default ru;
