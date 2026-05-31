# Google Forms Setup for Tour Requests

Use the `barbersbronson@gmail.com` Google account so the Barbers Hub owner keeps access to submissions.

## Create the form

1. Sign in to Google with `barbersbronson@gmail.com`.
2. Open [Google Forms](https://forms.google.com) and create a blank form.
3. Name it `Barbers Hub - Tour Request`.
4. Add these required short-answer questions:
   - `Full name`
   - `Email`
   - `Phone number`
5. In the form settings, do not require Google sign-in. Barber leads should be able to submit the form without a Google account.
6. Open the `Responses` tab and link a Google Sheet if you want an easy lead list.

## Send the integration details

1. Open the form preview and submit one test response.
2. Send the form editor URL to the website maintainer.

The maintainer will extract the Google Forms submission URL and the three `entry.<number>` field IDs, then add them to `js/barbers-v2.js` and `js/barbers-v2.min.js`.

Until those details are added, the website tour form opens an email draft addressed to `barbersbronson@gmail.com`.
