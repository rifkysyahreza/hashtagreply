# hashtagreply
Auto reply in tweet that has a specific keyword or hashtag (500 tweet maximum in one run)

1. Create folder (ex: D:/hashtagreply)
2. Open Windows CMD and point it to the folder (ex: D:/hashtagreply/)
3. Write this in cmd 

```
npm i readline-sync puppeteer twitter-v2
```
4. copy this repo file to your folder so the folder will contain:

```
node_modules
package
package-lock
TweetComment.js
TweetComment.txt
```

5. run the script

```
node index.js
```


Common Error

```
undefined
```
this one usually because come after texting a reply, what you need to do is, change the button text in line 130 
