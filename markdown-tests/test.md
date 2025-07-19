# Project Overview

This document gives a brief overview of the system architecture.

## Architecture Diagram

```mermaid
graph TD
  A[Client] --> B[Load Balancer]
  B --> C[Web Server 1]
  B --> D[Web Server 2]
  C --> E[Database]
  D --> E[Database]
  E --> F[Backup Server]


