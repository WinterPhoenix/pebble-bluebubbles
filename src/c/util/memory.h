#pragma once

#include <stdlib.h>
#include <string.h>

/// @brief Safer version of malloc that aborts if the allocation fails. Prohibits 0-byte allocations.
/// @param bytes The number of bytes to allocate.
/// @return void*
void *safer_malloc(size_t bytes)
{
    if (bytes == 0) {
        fprintf(stderr, "FATAL: Cannot allocate 0 bytes!\n");
        abort();
    }
    void *ptr = malloc(bytes);
    if (ptr == NULL) {
        fprintf(stderr, "FATAL: Failed to allocate %zu bytes!\n", bytes);
        abort();
    }
    return ptr;
}

static inline void *malloc0(size_t size) {
  void *buf = malloc(size);
  if (!buf) {
    return buf;
  }

  memset(buf, 0, size);
  return buf;
}

