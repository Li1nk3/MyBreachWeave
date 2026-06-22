FROM --platform=linux/amd64 kalilinux/kali-rolling

ARG KALI_MIRROR=http://mirrors.aliyun.com/kali
ARG PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
ARG NPM_REGISTRY=https://registry.npmmirror.com
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG ALL_PROXY
ARG NO_PROXY
ARG http_proxy
ARG https_proxy
ARG all_proxy
ARG no_proxy

ENV DEBIAN_FRONTEND=noninteractive
ENV AGENT_BROWSER_HEADLESS=1
ENV AGENT_BROWSER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PIP_INDEX_URL=${PIP_INDEX_URL}
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV npm_config_registry=${NPM_REGISTRY}

RUN set -eux; \
    rm -f /etc/apt/sources.list /etc/apt/sources.list.d/*; \
    printf 'deb %s kali-rolling main contrib non-free non-free-firmware\n' "$KALI_MIRROR" > /etc/apt/sources.list; \
    printf 'Acquire::Retries "5";\nAcquire::http::Timeout "60";\nAcquire::https::Timeout "60";\nAcquire::Queue-Mode "access";\n' > /etc/apt/apt.conf.d/80-retries; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        wget \
        git \
        unzip \
        jq \
        file \
        xxd \
        binutils \
        build-essential \
        gdb \
        gdbserver \
        checksec \
        patchelf \
        strace \
        ltrace \
        socat \
        qemu-user \
        openssh-client \
        iproute2 \
        iputils-ping \
        netcat-openbsd \
        python3 \
        python-is-python3 \
        python3-dev \
        python3-pip \
        python3-venv \
        sqlite3 \
        chromium \
        chromium-sandbox \
        fonts-liberation \
        fonts-noto-color-emoji \
        fonts-noto-cjk \
        nmap \
        gobuster \
        ffuf \
        whatweb \
        sqlmap \
        dirsearch \
        nodejs \
        npm; \
    rm -rf /var/lib/apt/lists/*

RUN python -m pip install --break-system-packages --no-cache-dir \
        httpx \
        requests \
        websocket-client \
        dnspython \
        pwntools \
        pycryptodome \
        scapy \
        beautifulsoup4 \
        lxml \
        pyyaml \
        jsbeautifier \
        colorama \
        tqdm \
        rich \
        flask \
        jinja2 \
        flask-unsign \
        pyjwt \
        sympy \
        z3-solver \
        ROPGadget \
        ropper

RUN set -eux; \
    npm install -g --prefix /opt/bun bun@1.3.11; \
    ln -sf /opt/bun/bin/bun /usr/local/bin/bun; \
    bun --version; \
    if npm install -g --prefix /opt/agent-browser agent-browser@latest; then \
        ln -sf /opt/agent-browser/bin/agent-browser /usr/local/bin/agent-browser; \
        agent-browser --version; \
    else \
        echo "agent-browser install failed; continuing with curl/python/chromium available"; \
    fi

RUN touch /root/THIS_IS_DOCKER_CONTAINER_NOT_TARGET_MACHINE.txt

WORKDIR /root/workspace
