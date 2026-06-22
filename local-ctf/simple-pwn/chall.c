#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void win(void) {
    puts("flag{simple_ret2win_local_test}");
    fflush(stdout);
    _exit(0);
}

void vuln(void) {
    char buf[64];
    puts("simple ret2win");
    puts("send your payload:");
    read(0, buf, 200);
    puts("bye");
}

int main(void) {
    setbuf(stdout, NULL);
    vuln();
    return 0;
}
