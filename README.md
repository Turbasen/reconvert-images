# reconvert-images

Script to re-upload old images and save the new reference in Nasjonal Turbase
along with updated metadata if applicable.

## Prerequisite

* Docker >= 1.5
* Docker Compose >= 1.2

## .env

* `NTB_API_KEY` - you API key to Nasjonal Turbase
* `UPLOAD_URL` - service to upload old images to

## Check

Utility to check refering objects for a list of images. The utility can also
remove any references (`--patch` and/or the image itself (`--delete`).

```
$ docker-compose run --rm dev npm run check -- --help
> Usage: npm run check [options]
>
> Options:
>    --env ENV      Nasjonal Turbase environment  [dev]
>    -f, --file     Line seperated file with image _ids to check
>    -i, --ids      Comma seperated list of image _ids to check
>    -p, --patch    Remove image references from other objects
>    -d, --delete   Delete image from Nasjonal Turbase
>    -d, --debug    Print debugging info
```

## Sync

Re-upload old image to a new uploader and save the new image URLs back to
Nasjonal Turbase.

```
$ docker-compose run --rm dev npm start -- --help
> Usage: npm start [options]
>
> Options:
>    --env ENV    Nasjonal Turbase environment  [dev]
>    --no-debug   Do not print debugging info
```

## [MIT License](https://github.com/Turistforeningen/reconvert-images/blob/master/LICENSE)
