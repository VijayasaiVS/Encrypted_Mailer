**Encrypted Mailing Service:**
			A Web Based Application to send encrypted mails to any mail id.
			
			
***Note:***

		———————————————————————————————————————————————————————————————————————
		
	 ***!!!This application is build by me for basic understanding of HTML,CSS,JS!!!***
	 
	 ***!!!This application doesn't have a huge functionality(/userful one) but only for fun!!!***
	 
		———————————————————————————————————————————————————————————————————————
	 
	 
**Technology Used:**

*HTML* 		- To build the web page (front end)
*CSS* 		- Styling the Web Pages	 
*NodeJs*	- Backend

**How to Run:**

1) Clone the repository to your computer
2) Make use of a powerful editor (I used Visual Studio Code)
3) Install nodejs in your computer		
4) Open the "Encrypted_Mailer" folder through visual studio code
5) Open terminal and type
		"npm install"
	wait for the packages from the "package.json to install automatically
6) Enter your own email id and password in *.env* file to access the email sending API
	*-Go to https://myaccount.google.com/security if mail cant be sent from your account and Turn On "Less Secure App Access"*
7) Type npm start/npm server start to start the application.
8) Visit http://localhost:9000/email.html
_______________________________________________________________
*Thanks to https://github.com/santhosh-d for his contribution on Client Side Decryption Work!!*

**Client Side**

1. Open the "Client Side" folder in receiver's side computer.
2. Do the step 2,3,4(here open Client Side folder instead),5.
3. After Successful installation of the modules there are some steps to be done,
   - Go to https://developers.google.com/gmail/api/quickstart/nodejs
   - Enable Gmail API for the account to be used in Client side
   - Download 'credentials.json' file (Every account has different configuration file)
   - Your good to go with credentials.json file.
   - After installing required packages type 'node index' in terminal
   - When you run the program for the first time, a link will appear in the terminal! Open it and login to the account from which you want to read the Encrypted mail
   - After successful login you will be given a token to access the account via this program. Paste that in the terminal and your all set to go. Lets encrypt some Mails.
