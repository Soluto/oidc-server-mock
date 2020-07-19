#!/usr/bin/env bash
set -o

install_kind() {
    echo "Installing kind (v$KIND_VERSION)..."
    curl -sfSLo kind "https://github.com/kubernetes-sigs/kind/releases/download/v$KIND_VERSION/kind-linux-amd64"
    chmod +x kind
    sudo mv kind /usr/local/bin/kind
}

install_kubectl() {
    echo "Installing kubectl (v$KUBECTL_VERSION)..."
    curl -sfSLO "https://storage.googleapis.com/kubernetes-release/release/v$KUBECTL_VERSION/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/kubectl
}

create_cluster() {
    delete_cluster
    echo "Creating cluster $CLUSTER_NAME..."
    kind create cluster --name "$CLUSTER_NAME"
}

delete_cluster() {
    clustername=`kind get clusters | grep $CLUSTER_NAME`
    if [[ ! -z "$clustername" ]]
    then
        echo "Deleting cluster $clustername..."
        kind delete cluster --name "$clustername"
    fi
}

report_error_and_exit() {
    echo "Error on line $1 with error code $2"
    exit $2
}

build_images() {
    echo "Building images..."
    docker build -t soluto/oidc-server-mock '../src'
    docker build -t soluto/e2e '.'
}

load_images() {
    echo "Loading images to cluster..."
    kind load docker-image --name "$CLUSTER_NAME" soluto/oidc-server-mock
    kind load docker-image --name "$CLUSTER_NAME" soluto/e2e
}

prepare_environment() {
    echo "Configuring kubectl..."
    local oldKUBECONFIG="$KUBECONFIG"
    KUBECONFIG="$(kind get kubeconfig-path --name=$CLUSTER_NAME)"
    export KUBECONFIG

    echo "Creating kubernetes objects..."

    # oidc-service
    kubectl apply -f ./kubernetes/oidc-server-mock.yaml
}

execute_tests() {

    # running e2e
    echo "Waiting for things to get ready...($STARTUP_TIMEOUT seconds at most for each service)"
    kubectl wait pod -l app=oidc-server-mock --for condition=Ready --timeout="$STARTUP_TIMEOUT"s

    echo "Running e2e tests job..."
    kubectl apply -f ./kubernetes/e2e.yaml

    echo "Waiting for e2e test job to start...($STARTUP_TIMEOUT seconds at most)"
    kubectl  wait pod -l job-name=e2e --for condition=Ready --timeout "$STARTUP_TIMEOUT"s
    echo "E2E job is running..."
    kubectl  logs -l job-name=e2e -f
    echo "Waiting for e2e test job to complete...($TEST_TIMEOUT seconds at most)"
    kubectl  wait --for condition=complete --timeout "$TEST_TIMEOUT"s jobs/e2e
    exitCode=$(kubectl  get pods -l job-name=e2e -o jsonpath='{.items[*].status.containerStatuses[*].state.terminated.exitCode}')
    reason=$(kubectl  get pods -l job-name=e2e -o jsonpath='{.items[*].status.containerStatuses[*].state.terminated.Reason}')

    echo "The tests finished with exit code $exitCode and message: $reason"

    KUBECONFIG="$oldKUBECONFIG"
    export KUBECONFIG
    exit $exitCode
}

parse_options() {
    # parse command line options
    for i in "$@"
    do
    case $i in
        --kind-version=*)
        KIND_VERSION="${i#*=}"
        ;;

        --kubectl-version=*)
        KUBECTL_VERSION="${i#*=}"
        ;;

        --cluster-name=*)
        CLUSTER_NAME="${i#*=}"
        ;;

        --startup-timeout=*)
        STARTUP_TIMEOUT="${i#*=}"
        ;;

        --test-time=*)
        TEST_TIMEOUT="${i#*=}"
        ;;

        *)
        echo "Unknown argument $i"
        exit 1
        ;;
    esac
    done

    if [[ -z "$KIND_VERSION" ]]
    then
        KIND_VERSION="0.8.1"
    fi

    if [[ -z "$KUBECTL_VERSION" ]]
    then
        KUBECTL_VERSION="1.18.0"
    fi

    if [[ -z "$CLUSTER_NAME" ]]
    then
        CLUSTER_NAME="e2e"
    fi

    if [[ -z "$STARTUP_TIMEOUT" ]]
    then
        STARTUP_TIMEOUT=60
    fi

    if [[ -z "$TEST_TIMEOUT" ]]
    then
        TEST_TIMEOUT=60
    fi
}

main() {
    trap delete_cluster EXIT
    trap 'report_error_and_exit $LINENO $?' ERR
    parse_options "$@"

    if [[ ! -z "$CI" ]]
    then
        install_kind
        install_kubectl
    else
        build_images
    fi

    create_cluster
    load_images
    prepare_environment
    execute_tests
}

main "$@"
