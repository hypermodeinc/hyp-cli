#!/usr/bin/env bash

#
# SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
# SPDX-License-Identifier: Apache-2.0
#

# Run with: curl install.hypermode.com/hyp.sh -sSfL | bash

# Config
CLI_NAME="Hyp CLI"
PACKAGE_ORG="@hypermode"
PACKAGE_NAME="hyp-cli"
INSTALL_DIR="${HYP_CLI:-"${HOME}/.hypermode/cli"}"
VERSION="latest"
INSTALLER_VERSION="0.1.1"

NODE_MIN=22
NODE_PATH="$(command -v node)"
NPM_PATH="$(command -v npm)"

# Properties
ARCH="$(uname -m)"
OS="$(uname -s)"

# ANSI escape codes
if [[ -t 1 ]]; then
	CLEAR_LINE="\e[1A\e[2K\e[2K"
	BOLD="\e[1m"
	BLUE="\e[34;1m"
	YELLOW="\e[33m"
	RED="\e[31m"
	DIM="\e[2m"
	RESET="\e[0m"
else
	CLEAR_LINE=""
	BOLD=""
	BLUE=""
	YELLOW=""
	RED=""
	DIM=""
	RESET=""
fi

get_latest_version() {
	npm show ${PACKAGE_ORG:+${PACKAGE_ORG}/}"${PACKAGE_NAME}" version
}

download_from_npm() {
	local tmpdir="$1"
	local url="$2"
	local filename="${PACKAGE_NAME}-${VERSION}.tgz"
	local download_file="${tmpdir}/${filename}"

	mkdir -p "${tmpdir}"

	if ! curl --progress-bar --show-error --location --fail "${url}" --output "${download_file}"; then
		return 1
	fi

	printf %b "${CLEAR_LINE}" >&2
	echo "${download_file}"
}

echo_fexists() {
	[[ -f $1 ]] && echo "$1"
}

detect_profile() {
	local shellname="$1"
	local uname="$2"

	if [[ -f ${PROFILE} ]]; then
		echo "${PROFILE}"
		return
	fi

	case "${shellname}" in
	bash)
		case ${uname} in
		Darwin)
			echo_fexists "${HOME}/.bash_profile" || echo_fexists "${HOME}/.bashrc"
			;;
		*)
			echo_fexists "${HOME}/.bashrc" || echo_fexists "${HOME}/.bash_profile"
			;;
		esac
		;;
	zsh)
		echo "${HOME}/.zshrc"
		;;
	fish)
		echo "${HOME}/.config/fish/config.fish"
		;;
	*)
		local profiles
		case ${uname} in
		Darwin)
			profiles=(.profile .bash_profile .bashrc .zshrc .config/fish/config.fish)
			;;
		*)
			profiles=(.profile .bashrc .bash_profile .zshrc .config/fish/config.fish)
			;;
		esac

		for profile in "${profiles[@]}"; do
			echo_fexists "${HOME}/${profile}" && break
		done
		;;
	esac
}

build_path_str() {
	local profile="$1" install_dir="$2"
	if [[ ${profile} == *.fish ]]; then
		echo -e "set -gx HYP_CLI \"${install_dir}\"\nstring match -r \".hypermode\" \"\$PATH\" > /dev/null; or set -gx PATH \"\$HYP_CLI/bin\" \$PATH"
	else
		install_dir="${install_dir/#${HOME}/\$HOME}"
		echo -e "\n# ${CLI_NAME}\nexport HYP_CLI=\"${install_dir}\"\nexport PATH=\"\$HYP_CLI/bin:\$PATH\""
	fi
}

cli_dir_valid() {
	if [[ -n ${HYP_CLI-} ]] && [[ -e ${HYP_CLI} ]] && ! [[ -d ${HYP_CLI} ]]; then
		printf "\$HYP_CLI is set but is not a directory (%s).\n" "${HYP_CLI}" >&2
		printf "Please check your profile scripts and environment.\n" >&2
		exit 1
	fi
	return 0
}

update_profile() {
	local install_dir="$1"
	if [[ ":${PATH}:" == *":${install_dir}:"* ]]; then
		printf "[3/4] %sThe %s is already in \$PATH%s\n" "${DIM}" "${CLI_NAME}" "${RESET}" >&2
		return 0
	fi

	local shell os profile
	shell="$(basename "${SHELL}")"
	os="$(uname -s)"
	profile="$(detect_profile "${shell}" "${os}")"
	if [[ -z ${profile} ]]; then
		printf "No user shell profile found.\n" >&2
		return 1
	fi

	export SHOW_RESET_PROFILE=1

	PROFILE="${HOME}/$(basename "${profile}")"
	export PROFILE

	if grep -q 'HYP_CLI' "${profile}"; then
		printf %b "[3/4] ${DIM}The ${CLI_NAME} has already been configured in ${PROFILE}${RESET}\n" >&2
		return 0
	fi

	local path_str
	path_str="$(build_path_str "${profile}" "${install_dir}")"
	echo "${path_str}" >>"${profile}"

	printf %b "[3/4] ${DIM}Added the ${CLI_NAME} to the PATH in ${PROFILE}${RESET}\n" >&2
}

install_version() {
	if ! cli_dir_valid; then
		exit 1
	fi

	case "${VERSION}" in
	latest)
		VERSION="$(get_latest_version)"
		;;
	*) ;;
	esac

	if ! install_release; then
		update_profile "${INSTALL_DIR}" && printf %b "[4/4] ${DIM}Installed the ${CLI_NAME}${RESET}\n" >&2
	fi
}

install_release() {
	printf %b "[1/4] ${DIM}Downloading the ${CLI_NAME} from NPM${RESET}\n"

	local url="https://registry.npmjs.org/${PACKAGE_ORG:+${PACKAGE_ORG}/}${PACKAGE_NAME}/-/${PACKAGE_NAME}-${VERSION}.tgz"

	download_archive="$(
		download_release "${url}"
		exit "$?"
	)"
	exit_status="$?"
	if [[ ${exit_status} != 0 ]]; then
		printf %b "Could not download the ${CLI_NAME} version '${VERSION}' from\n${url}\n" >&2
		exit 1
	fi

	printf %b "${CLEAR_LINE}" >&2
	printf %b "[1/4] ${DIM}Downloaded latest ${CLI_NAME} v${VERSION}${RESET}\n" >&2

	install_from_file "${download_archive}"
}

download_release() {
	local url download_dir
	url="$1"
	download_dir="$(mktemp -d)"
	download_from_npm "${download_dir}" "${url}"
}

install_from_file() {
	local archive extract_to
	archive="$1"
	extract_to="$(dirname "${archive}")"

	printf %b "[2/4] ${DIM}Unpacking archive${RESET}\n" >&2

	tar -xf "${archive}" -C "${extract_to}"

	rm -rf "${INSTALL_DIR}"
	mkdir -p "${INSTALL_DIR}"
	rm -f "${archive}"
	mv "${extract_to}/package/"* "${INSTALL_DIR}"
	rm -rf "${extract_to}"

	ln -s "${INSTALL_DIR}/bin/run.js" "${INSTALL_DIR}/bin/hyp"

	printf %b "${CLEAR_LINE}" >&2
	printf %b "[2/4] ${DIM}Installing dependencies${RESET}\n" >&2
	(cd "${INSTALL_DIR}" && "${NPM_PATH}" install --omit=dev --silent && find . -type d -empty -delete)

	printf %b "${CLEAR_LINE}" >&2
	printf %b "[2/4] ${DIM}Unpacked archive${RESET}\n" >&2
}

check_platform() {
	case ${ARCH} in
	arm64) ARCH="arm64" ;;
	x86_64) ARCH="x64" ;;
	*) ;;
	esac

	case "${ARCH}/${OS}" in
	x64/Linux | arm64/Linux | x64/Darwin | arm64/Darwin) return 0 ;;
	*)
		printf "Unsupported os %s %s\n" "${OS}" "${ARCH}" >&2
		exit 1
		;;
	esac
}

check_node() {
	if [[ -z ${NODE_PATH} ]]; then
		printf %b "${RED}Node.js is not installed.${RESET}\n" >&2
		printf %b "${RED}Please install Node.js ${NODE_WANTED} or later and try again.${RESET}\n" >&2
		exit 1
	fi

	# check node version
	local node_version node_major
	node_version="$("${NODE_PATH}" --version)"
	node_major="${node_version%%.*}"
	node_major="${node_major#v}"
	if [[ ${node_major} -lt ${NODE_MIN} ]]; then
		printf %b "${RED}Node.js ${NODE_MIN} or later is required. You have ${node_version}.${RESET}\n" >&2
		printf %b "${RED}Please update and try again${RESET}\n" >&2
		exit 1
	fi

	# make sure npm can be found too
	if [[ -z ${NPM_PATH} ]]; then
		printf %b "${RED}npm is not installed. Please install npm and try again.${RESET}\n" >&2
		exit 1
	fi
}

# This is the entry point
printf %b "\n${BOLD}${BLUE}Modus${RESET} Installer ${DIM}v${INSTALLER_VERSION}${RESET}\n\n" >&2

check_platform
check_node
install_version

printf "\nThe Modus CLI has been installed! 🎉\n" >&2

if [[ -n ${SHOW_RESET_PROFILE-} ]]; then
	printf %b "\n${YELLOW}Please restart your terminal or run:${RESET}\n" >&2
	printf %b "  ${DIM}source ${PROFILE}${RESET}\n" >&2
	printf %b "\nThen, run ${DIM}modus${RESET} to get started${RESET}\n" >&2
else
	printf %b "\nRun ${DIM}modus${RESET} to get started${RESET}\n" >&2
fi

printf "\n" >&2
