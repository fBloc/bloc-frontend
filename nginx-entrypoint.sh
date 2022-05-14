WWW_DIR=/app

ENV_SRC="${WWW_DIR}/env.template.js"
ENV_DST="${WWW_DIR}/env.js"
envsubst < "${ENV_SRC}" > "${ENV_DST}"
echo "done! copied"
[ -z "$@" ] && nginx -g 'daemon off;' || $@

