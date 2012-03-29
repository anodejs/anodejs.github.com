# anodejs.org

### Building the site

#### 1. Clone this repository (or fetch/rebase)

##### Clone (new work tree)

```bash
$ git clone git@github.com:anodejs/anodejs.github.com.git blog
$ cd blog
```

##### Fetch/rebase (existing work tree)

```bash
$ cd blog
$ git fetch origin
$ git rebase origin/master
```

#### 2. Run build

```bash
$ node build.js
```

Build will modify two files:

 1. `index.html` - that's the site
 2. `rss.xml` - the rss feed

#### 3. Commit changes and push to master

```bash
$ git commit -am '<put your message here'
$ git fetch origin            # to make sure we are rebased
$ git rebase origin/master
$ git push origin master
```

