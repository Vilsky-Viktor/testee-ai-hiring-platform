# Hosts a request to an address someone gave never goes to: Cloud Run and Google's APIs answer on
# public addresses, yet a call from a service reaches them through the VPC as internal traffic,
# past Cloud Armor; testee.ai is the site itself.
NOT_REACHED_HOSTS = (".run.app", ".googleapis.com", "testee.ai", ".testee.ai")
