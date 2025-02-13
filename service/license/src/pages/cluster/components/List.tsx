import { getClusterList } from '@/api/cluster';
import { EmptyIcon, TimeIcon } from '@/components/Icon';
import Pagination from '@/components/Pagination';
import useClusterDetail from '@/stores/cluster';
import { ClusterResult, ClusterType } from '@/types';
import { formatTime } from '@/utils/tools';
import { Box, Center, Flex, Icon, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function ClusterRecord() {
  const { clusterDetail, setClusterDetail } = useClusterDetail();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();

  const { data } = useQuery(['getClusterList', page, pageSize], () =>
    getClusterList({
      page: page,
      pageSize: pageSize
    })
  );

  return (
    <Flex
      flex={'0 1 40%'}
      flexDirection={'column'}
      alignItems={'center'}
      pt="52px"
      pb="40px"
      px={{ base: '12px', md: '20px', lg: '42px' }}
      position={'relative'}
    >
      <Text mb="10px" color={'#262A32'} fontSize={'24px'} fontWeight={600} alignSelf={'flex-start'}>
        {t('Cluster List')}
      </Text>
      {data?.records && data?.records?.length > 0 ? (
        <Box w="100%" flex={1} overflowY={'scroll'} pb="20px">
          {data?.records.map((item, i) => (
            <Flex
              key={item?.clusterId}
              w="100%"
              h="72px"
              alignItems={'center'}
              justifyContent={'center'}
              border={
                clusterDetail?.clusterId === item.clusterId
                  ? '1px solid #36ADEF'
                  : '1px solid #EFF0F1'
              }
              borderRadius={'4px'}
              background={'#F8FAFB'}
              mt="16px"
              _hover={{ border: '1px solid #36ADEF' }}
              onClick={() => setClusterDetail(item)}
              px="24px"
              cursor={'pointer'}
            >
              <Flex w="100%" flexDirection={'column'}>
                <Flex>
                  <Text
                    color={'#485058'}
                    fontSize={'16px'}
                    fontWeight={500}
                    mr="12px"
                    // w={'110px'}
                    maxW={'110px'}
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                  >
                    {item?.displayName ? item.displayName : `${t('Cluster')}`}
                  </Text>
                  <Center
                    bg={
                      item.type === ClusterType.Standard
                        ? 'rgba(0, 169, 166, 0.10)'
                        : 'rgba(33, 155, 244, 0.10)'
                    }
                    color={item.type === ClusterType.Standard ? '#00A9A6' : '#219BF4'}
                    borderRadius="4px"
                    p="3px 8px"
                    fontSize={'12px'}
                    fontWeight={500}
                  >
                    {t(item.type)}
                  </Center>
                </Flex>
                <Text mt="8px" color={'#7B838B'} fontSize={'11px'} fontWeight={400}>
                  集群ID: {item?.kubeSystemID ? item?.kubeSystemID : '未绑定'}
                  {/* {formatTime(item.createdAt, 'YYYY-MM-DD HH:mm')} */}
                </Text>
              </Flex>
              <Flex justifyContent={'center'} alignItems={'center'} ml="auto" flexShrink={0}>
                {item?.kubeSystemID ? (
                  <>
                    <Icon
                      xmlns="http://www.w3.org/2000/svg"
                      w="16px"
                      h="16px"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M16.6667 5L7.50004 14.1667L3.33337 10"
                        stroke={'#00A9A6'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Icon>
                    <Text ml="4px" color={'#00A9A6'} fontSize={'12px'} fontWeight={500}>
                      已激活
                    </Text>
                  </>
                ) : (
                  <>
                    <TimeIcon w="16px" h="16px" color={'#8172D8'} />
                    <Text ml="4px" color={'#8172D8'} fontSize={'12px'} fontWeight={500}>
                      未激活
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>
          ))}
        </Box>
      ) : (
        <Flex
          w="100%"
          flex={1}
          overflowY={'auto'}
          pb="20px"
          pr="12px"
          justifyContent={'center'}
          alignItems={'center'}
          flexDirection={'column'}
        >
          <EmptyIcon />
          <Text mt="20px" color={'#5A646E'} fontWeight={500} fontSize={'14px'}>
            {t('You have not purchased the License')}
          </Text>
        </Flex>
      )}
      <Flex ml="auto" mt={'auto'} pr="20px">
        <Pagination
          totalItems={data?.total || 0}
          itemsPerPage={pageSize}
          onPageChange={(page) => {
            setPage(page);
          }}
        />
      </Flex>
    </Flex>
  );
}
