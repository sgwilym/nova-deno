if [ $ALLOW_ALL = 'true' ] 
then
  deno run --allow-all$([[ ! -z "$CERT" ]] && echo " --cert==$CERT")$([[ ! -z "$CONFIG" ]] && echo " --config==$CONFIG")$([[ ! -z "$IMPORT_MAP" ]] && echo " --import-map==$IMPORT_MAP")$([[ ! -z "$CUSTOM_OPTIONS" ]] && echo "$CUSTOM_OPTIONS") $SCRIPT $USER_ARGS
else
  deno run $([[ $ALLOW_READ = 'true' ]] && echo " --allow-read") $([[ $ALLOW_WRITE = 'true' ]] && echo " --allow-write") $([[ $ALLOW_NET = 'true' ]] && echo " --allow-net") $([[ $ALLOW_RUN = 'true' ]] && echo " --allow-run") $([[ $ALLOW_ENV = 'true' ]] && echo " --allow-env") $([[ ! -z "$CERT" ]] && echo " --cert==$CERT") $([[ ! -z "$CONFIG" ]] && echo " --config==$CONFIG") $([[ ! -z "$IMPORT_MAP" ]] && echo " --import-map==$IMPORT_MAP") $([[ ! -z "CUSTOM_OPTIONS" ]] && echo "$CUSTOM_OPTIONS") $SCRIPT $USER_ARGS
fi