const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

async function sendMessage(chatId: string, text: string) {
  if (!BOT_TOKEN || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch {
    // non-critical — swallow
  }
}

export async function notifyBookingCreated(params: {
  userTelegramId: string
  ownerTelegramId: string
  fieldName: string
  date: string
  startTime: string
  endTime: string
  totalPrice: number
}) {
  const { userTelegramId, ownerTelegramId, fieldName, date, startTime, endTime, totalPrice } = params

  // To the user who booked
  await sendMessage(
    userTelegramId,
    `✅ <b>Бронь принята!</b>\n\n` +
    `🏟️ ${fieldName}\n` +
    `📅 ${date}  ⏰ ${startTime}–${endTime}\n` +
    `💰 ${totalPrice.toLocaleString('ru-RU')} сум\n\n` +
    `Ожидайте подтверждения от владельца поля.`,
  )

  // To the field owner
  await sendMessage(
    ownerTelegramId,
    `🔔 <b>Новая бронь!</b>\n\n` +
    `🏟️ ${fieldName}\n` +
    `📅 ${date}  ⏰ ${startTime}–${endTime}\n` +
    `💰 ${totalPrice.toLocaleString('ru-RU')} сум\n\n` +
    `Откройте кабинет, чтобы подтвердить или отклонить бронь.`,
  )
}

export async function notifyBookingConfirmed(params: {
  userTelegramId: string
  fieldName: string
  date: string
  startTime: string
  endTime: string
}) {
  const { userTelegramId, fieldName, date, startTime, endTime } = params
  await sendMessage(
    userTelegramId,
    `🎉 <b>Бронь подтверждена!</b>\n\n` +
    `🏟️ ${fieldName}\n` +
    `📅 ${date}  ⏰ ${startTime}–${endTime}\n\n` +
    `До встречи на поле! 💪`,
  )
}

export async function notifyBookingCancelled(params: {
  userTelegramId: string
  fieldName: string
  date: string
  startTime: string
  endTime: string
  byOwner?: boolean
}) {
  const { userTelegramId, fieldName, date, startTime, endTime, byOwner } = params
  await sendMessage(
    userTelegramId,
    `❌ <b>Бронь отменена</b>\n\n` +
    `🏟️ ${fieldName}\n` +
    `📅 ${date}  ⏰ ${startTime}–${endTime}\n\n` +
    `${byOwner ? 'Владелец поля отменил бронь.' : 'Вы отменили бронь.'} Выберите другое время.`,
  )
}

export async function notifyFieldApproved(ownerTelegramId: string, fieldName: string) {
  await sendMessage(
    ownerTelegramId,
    `✅ <b>Ваше поле одобрено!</b>\n\n` +
    `🏟️ ${fieldName}\n\n` +
    `Поле теперь видно всем пользователям ПОЛЕ. Начните принимать брони!`,
  )
}

export async function notifyFieldRejected(ownerTelegramId: string, fieldName: string) {
  await sendMessage(
    ownerTelegramId,
    `❌ <b>Поле не прошло проверку</b>\n\n` +
    `🏟️ ${fieldName}\n\n` +
    `Свяжитесь с поддержкой для уточнения причины.`,
  )
}
