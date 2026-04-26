# ABSTRACT

**SecureCloud: An Advanced Secure Data Outsourcing System for Cloud-WSN Environments**

The rapid expansion of Wireless Sensor Networks (WSNs) and cloud computing has necessitated secure and efficient data outsourcing mechanisms. This project, "SecureCloud," addresses the critical challenges of data confidentiality and high latency in cloud-based storage by implementing a robust, parallelized encryption framework. 

SecureCloud utilizes a hybrid cryptographic approach, combining the efficiency of AES-256-GCM for bulk data encryption with the fine-grained control of Ciphertext-Policy Attribute-Based Encryption (CP-ABE). This combination ensures that sensitive data remains secure even in untrusted cloud environments, while allowing data owners to define complex access policies based on user attributes. 

To overcome the latency bottlenecks typical of traditional sequential encryption, the system implements a "Split-then-Encrypt" architecture. Data files are fragmented into multiple chunks and processed concurrently across parallel execution threads. Experimental results demonstrate that this parallelized approach achieves approximately a 40% reduction in encryption and decryption latency compared to conventional single-threaded schemes, making it ideal for latency-sensitive applications.

The implementation features a scalable Node.js backend, a MongoDB database for metadata and audit logs, and a responsive React-based frontend dashboard. Key system highlights include proactive key lifecycle management with active rotation, real-time monitoring of system metrics, and a user-centric interface for managing access policies and monitoring file transfers.

In summary, SecureCloud provides a comprehensive and scalable solution for secure data outsourcing. By harmonizing high-level security through CP-ABE with the high-speed performance of parallelized AES encryption, the project establishes a practical and efficient framework for managing sensitive information in modern cloud-WSN ecosystems. This abstract stands as a self-contained summary of the project's technical methodology, implementation highlights, and significant performance results.
