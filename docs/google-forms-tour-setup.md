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

## Connected form

Current form editor URL:
`https://docs.google.com/forms/d/1gcPpHlLIkafyb98jLcrn6a6vu1lp8zjVDVBNXjvB2vk/edit`

Current public response endpoint:
`https://docs.google.com/forms/d/e/1FAIpQLSee1r8k08zEb3Hqubn0K6XmsOmnS8BV2TDgKk2jhkguS-kZuQ/formResponse`

Current field IDs:
- `Full Name` -> `entry.409224256`
- `Email` -> `entry.1733478299`
- `Phone number` -> `entry.2119825748`

The website tour form is wired in `js/barbers-v2.js` and `js/barbers-v2.min.js`.

## Send the integration details

1. Open the form preview and submit one test response.
2. Send the form editor URL to the website maintainer.

The maintainer will extract the Google Forms submission URL and the three `entry.<number>` field IDs, then add them to `js/barbers-v2.js` and `js/barbers-v2.min.js`.

If those details are removed or the Google Form changes, the website tour form opens an email draft addressed to `barbersbronson@gmail.com`.
