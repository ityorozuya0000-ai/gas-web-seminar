export class MailService {

    sendPaymentLink(email: string, paymentLink: string, seminarTitle: string) {
        const subject = `【お支払い】${seminarTitle} セミナー申込み`;
        const body = `
${seminarTitle} にお申し込みいただきありがとうございます。

以下のリンクよりお支払いをお願いいたします。
お支払いが確認取れ次第、ZoomのURLをお送りいたします。

決済リンク:
${paymentLink}

※本メールに心当たりがない場合は破棄してください。
    `;

        GmailApp.sendEmail(email, subject, body);
    }

    sendBookingConfirmation(email: string, seminarTitle: string, zoomUrl: string, myPageLink: string) {
        const subject = `【予約確定】${seminarTitle} 参加用URLのご案内`;
        const body = `
お支払いが確認できました。
ご予約が確定いたしました。

当日は以下のZoom URLよりご参加ください。

Zoom URL:
${zoomUrl}

ご予約状況は以下のマイページよりご確認いただけます。
${myPageLink}

当日のご参加を心よりお待ちしております。
    `;

        GmailApp.sendEmail(email, subject, body);
    }
}
